import { Extractor, ExtractorConfig, ExtractorResult } from '@microsoft/api-extractor'
import {
  ApiMethodSignature,
  ApiModel,
  ApiParameterListMixin,
  ApiReturnTypeMixin,
} from '@microsoft/api-extractor-model'
import { Command } from 'commander'
import { writeFileSync } from 'fs'
import { OpenAPIV3 } from 'openapi-types'
import { resolve } from 'path'
import * as TJS from 'ts-json-schema-generator'

import module from 'module'

const requireCjs = module.createRequire(import.meta.url)

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

  let fixedSymbol = symbol.replace(/Array\<(.*)\>/gm, '$1')

  const schema = generator.createSchema(fixedSymbol)

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
  schemaStr = schemaStr.replace(/https \:\/\//gm, 'https://')
  // a bug in the schema generator stack mangles @link tags with text.
  schemaStr = schemaStr.replace(/\{@link\s+([^|}]+?)\s([^|}]+)\s}/g, '{@link $1 | $2 }')
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
    // @ts-ignore
    return { type: response }
  } else {
    return { $ref: '#/components/schemas/' + response }
  }
}

const dev = new Command('dev').description('Plugin developer tools')

dev
  .command('generate-plugin-schema')
  .description('generate plugin schema')
  .option('-c, --extractorConfig <string>', 'API Extractor config file', './api-extractor.json')
  .option(
    '-p, --packageConfig <string>',
    'package.json file containing a Veramo plugin interface config',
    './package.json',
  )
  .option('-o, --output <string>', 'Output file of the schema', './src/plugin.schema.ts')

  .action(async (options) => {
    const apiExtractorJsonPath: string = resolve(options.extractorConfig)
    const outPutPath: string = resolve(options.output)
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

    const packageConfig = requireCjs(resolve(options.packageConfig))
    const interfaces: any = {}

    for (const pluginInterfaceName in packageConfig?.veramo?.pluginInterfaces) {
      const entryFile = packageConfig.veramo.pluginInterfaces[pluginInterfaceName]
      const api = {
        components: {
          schemas: {},
          methods: {},
        },
      }

      const generator = TJS.createGenerator({
        path: resolve(entryFile),
        encodeRefs: false,
        additionalProperties: true,
        skipTypeCheck: true,
      })

      const apiModel: ApiModel = new ApiModel()
      const apiPackage = apiModel.loadPackage(extractorConfig.apiJsonFilePath)

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
          // @ts-ignore
          ?.getChildNodes()[0]?.text

        method.description = method.description || ''

        if (method.parameters) {
          // @ts-ignore
          api.components.schemas = {
            // @ts-ignore
            ...api.components.schemas,
            ...createSchema(generator, method.parameters).components.schemas,
          }
        }

        // @ts-ignore
        api.components.schemas = {
          // @ts-ignore
          ...api.components.schemas,
          ...createSchema(generator, method.response).components.schemas,
        }

        // @ts-ignore
        api.components.methods[method.operationId] = {
          description: method.description,
          arguments: getReference(method.parameters),
          returnType: getReference(method.response),
        }
      }

      interfaces[pluginInterfaceName] = api
    }

    writeFileSync(resolve(outPutPath), `export const schema = ${JSON.stringify(interfaces, null, 2)}`)
  })

dev
  .command('extract-api')
  .description('Extract API')
  .option('-c, --extractorConfig <string>', 'API Extractor config file', './api-extractor.json')
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

export { dev }
