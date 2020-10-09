import { getAgent } from './setup'
import program from 'commander'
const fs = require('fs')
import { resolve, dirname } from "path"
import { writeFileSync, readFileSync } from 'fs'
import * as TJS from "ts-json-schema-generator"
import { JSONSchema7 } from "json-schema"
import { OpenAPIV3 } from 'openapi-types'
import { Extractor, ExtractorConfig, ExtractorResult } from '@microsoft/api-extractor'
import {
  ApiModel,
  ApiPackage,
  ApiParameterListMixin,
  ApiDocumentedItem,
  ApiReturnTypeMixin,
  ApiMethodSignature,
} from '@microsoft/api-extractor-model'

interface Method {
  packageName: string
  pluginInterfaceName: string
  operationId: string
  description?: string
  parameters?: string
  response: string
}
const genericTypes = ['boolean', 'string', 'number', 'any', 'Array<string>']

function createSchema(generator: TJS.SchemaGenerator, symbol: string) {
  if (genericTypes.includes(symbol)) {
    return { components: { schemas: {} } }
  }

  let fixedSymbol = symbol.replace('Array<', '').replace('>', '')

  const schema = generator.createSchema(fixedSymbol)
  // console.dir({ fixedSymbol, schema }, {depth: 10})

  const newSchema = {
    components: {
      schemas: schema.definitions,
    },
  }

  let schemaStr = JSON.stringify(newSchema, null, 2)

  schemaStr = schemaStr.replace(/#\/definitions\//gm, '#/components/schemas/')
  schemaStr = schemaStr.replace(/\"patternProperties\":{([^:]*):{[^}]*}}/gm, '"pattern": $1')
  schemaStr = schemaStr.replace(/Verifiable\<(.*)\>/gm, 'Verifiable-$1')
  schemaStr = schemaStr.replace(/Where\<(.*)\>/gm, 'Where-$1')
  schemaStr = schemaStr.replace(/Order\<(.*)\>/gm, 'Order-$1')
  schemaStr = schemaStr.replace(/FindArgs\<(.*)\>/gm, 'FindArgs-$1')
  return JSON.parse(schemaStr)
}

function getReference(response: string): OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject {
  if (!response) {
    return { type: 'object' }
  }

  if (response.slice(0, 6) === 'Array<') {
    const symbol = response.replace('Array<', '').replace('>', '') as
      | 'string'
      | 'number'
      | 'boolean'
      | 'object'
      | 'integer'
    return {
      type: 'array',
      items: genericTypes.includes(symbol) ? { type: symbol } : { $ref: '#/components/schemas/' + symbol },
    }
  }
  if (response === 'any') {
    return { type: 'object' }
  }

  if (['string', 'number', 'boolean', 'object', 'integer'].includes(response)) {
    //@ts-ignore
    return { type: response }
  } else {
    return { $ref: '#/components/schemas/' + response }
  }
}

program
  .command('generatePluginSchema')
  .description('Generate DAF plugin schema')
  .option('-p, --packageConfig <string>', 'package.json file containing DAF plugin interface config', './package.json')
  .option('-o, --outputFolder <string>', 'Generated schema typescript file', './src/schemas')

  .action(async (options) => {

    const packageConfig = require(resolve(options.packageConfig))

    for (const pluginInterfaceName in packageConfig.daf.pluginInterfaces) {
      const outputFile = resolve(options.outputFolder, pluginInterfaceName + '.ts')
      console.log('Writing', outputFile)

      const entryFile = packageConfig.daf.pluginInterfaces[pluginInterfaceName]
      const api = {
        components: {
          schemas: {},
          methods: {},
        },
      }

      const generator = TJS.createGenerator({
        path: resolve(entryFile),
        encodeRefs: false,
        additionalProperties: true
      })

      const apiModel: ApiModel = new ApiModel()
      const apiPackage = apiModel.loadPackage(resolve('./api', packageConfig.name + '.api.json'))
    
      const entry = apiPackage.entryPoints[0]

      const pluginInterface = entry.findMembersByName(pluginInterfaceName)[0]

      for (const member of pluginInterface.members) {
        const method: Partial<Method> = {}
        method.pluginInterfaceName = pluginInterfaceName
        method.operationId = member.displayName
        // console.log(member)
        method.parameters = (member as ApiParameterListMixin).parameters[0]?.parameterTypeExcerpt?.text
        method.response = (member as ApiReturnTypeMixin).returnTypeExcerpt.text
          .replace('Promise<', '')
          .replace('>', '')

        const methodSignature = member as ApiMethodSignature
        method.description = methodSignature.tsdocComment?.summarySection
          ?.getChildNodes()[0]
          //@ts-ignore
          ?.getChildNodes()[0]?.text


        method.description = method.description || ''

        if (method.parameters) {
          //@ts-ignore
          api.components.schemas = {
            //@ts-ignore
            ...api.components.schemas,
            ...createSchema(generator, method.parameters).components.schemas,
          }
        }
  
        //@ts-ignore
        api.components.schemas = {
          //@ts-ignore
          ...api.components.schemas,
          ...createSchema(generator, method.response).components.schemas,
        }
        
        //@ts-ignore
        api.components.methods[method.operationId] = {
          description: method.description,
          arguments: getReference(method.parameters),
          returnType: getReference(method.response)
        }
        
      }

      if (!fs.existsSync(resolve(options.outputFolder))) {
        fs.mkdirSync(resolve(options.outputFolder))
      }
      writeFileSync(outputFile, 'export default ' + JSON.stringify(api, null, 2))

    }



  })


  program
  .command('extractPluginApi')
  .description('Extract DAF plugin api ')
  .option('-c, --extractorConfig <string>', 'API Extractor config file')

  .action(async (options) => {

    const apiExtractorJsonPath: string = resolve(options.extractorConfig)
    const extractorConfig: ExtractorConfig = ExtractorConfig.loadFileAndPrepare(apiExtractorJsonPath)
    const extractorResult: ExtractorResult = Extractor.invoke(extractorConfig, {
      localBuild: true,
      showVerboseMessages: true,
    })

    if (!extractorResult.succeeded) {
      console.error(
        `API Extractor completed with ${extractorResult.errorCount} errors` +
          ` and ${extractorResult.warningCount} warnings`,
      )
      process.exitCode = 1
    }


  })
