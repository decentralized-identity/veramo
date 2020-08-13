import { resolve } from 'path'
import { writeFileSync } from 'fs'
import * as TJS from 'typescript-json-schema'
import { OpenAPIV3 } from 'openapi-types'
import {
  ApiModel,
  ApiPackage,
  ApiParameterListMixin,
  ApiDocumentedItem,
  ApiReturnTypeMixin,
  ApiMethodSignature,
} from '@microsoft/api-extractor-model'

const apiExtractorConfig = require('../api-extractor-base.json')

const outputFile = 'packages/daf-rest/src/openApiSchema.ts'

const agentPlugins: Record<string, Array<string>> = {
  'daf-core': ['IResolveDid', 'IDataStore', 'IKeyManager', 'IIdentityManager', 'IHandleMessage'],
  'daf-selective-disclosure': ['ISdr'],
  'daf-typeorm': ['IDataStoreORM'],
  'daf-w3c': ['IW3c'],
}

interface RestMethod {
  operationId: string
  description?: string
  parameters?: string
  response: string
}

const openApi: OpenAPIV3.Document = {
  openapi: '3.0.0',
  info: {
    title: 'DAF OpenAPI',
    version: '',
  },
  components: {
    schemas: {},
  },
  paths: {},
}

const genericTypes = ['boolean', 'string', 'number', 'any', 'Array<string>']

function createSchema(generator: TJS.JsonSchemaGenerator, symbol: string) {
  if (genericTypes.includes(symbol)) {
    return { components: { schemas: {} } }
  }

  //hack
  let fixedSymbol = symbol === 'EcdsaSignature | string' ? 'EcdsaSignature' : symbol
  // TODO fix 'EcdsaSignature | string' in openApi responses
  fixedSymbol = fixedSymbol.replace('Array<', '').replace('>', '')

  const schema = generator.getSchemaForSymbol(fixedSymbol)

  const newSchema = {
    components: {
      schemas: schema.definitions,
    },
  }

  let schemaStr = JSON.stringify(newSchema, null, 2)

  schemaStr = schemaStr.replace(/#\/definitions\//gm, '#/components/schemas/')
  schemaStr = schemaStr.replace(/\"patternProperties\":{([^:]*):{[^}]*}}/gm, '"pattern": $1')
  return JSON.parse(schemaStr)
}

function getParametersSchema(parameters?: string) {
  if (!parameters) {
    return []
  } else {
    return [{ $ref: '#/components/schemas/' + parameters }]
  }
}

function getResponseSchema(response: string): OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject {
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
    return {}
  }

  if (['string', 'number', 'boolean', 'object', 'integer'].includes(response)) {
    //@ts-ignore
    return { type: response }
  } else {
    return { $ref: '#/components/schemas/' + response }
  }
}

for (const packageName of Object.keys(agentPlugins)) {
  const program = TJS.getProgramFromFiles([resolve('packages/' + packageName + '/src/index.ts')])
  const generator = TJS.buildGenerator(program, { required: true, topRef: true, excludePrivate: false })

  const apiModel: ApiModel = new ApiModel()
  const apiPackage = apiModel.loadPackage(
    (apiExtractorConfig.docModel.apiJsonFilePath as string).replace('<unscopedPackageName>', packageName),
  )

  const entry = apiPackage.entryPoints[0]

  for (const pluginInterfaceName of agentPlugins[packageName]) {
    const pluginInterface = entry.findMembersByName(pluginInterfaceName)[0]

    // Collecting method information
    const methods: RestMethod[] = []
    for (const member of pluginInterface.members) {
      const method: Partial<RestMethod> = {}
      method.operationId = member.displayName
      // console.log(member)
      method.parameters = (member as ApiParameterListMixin).parameters[0]?.parameterTypeExcerpt?.text
      method.response = (member as ApiReturnTypeMixin).returnTypeExcerpt.text
        .replace('Promise<', '')
        .replace('>', '')

      method.description = (member as ApiMethodSignature).tsdocComment?.summarySection
        ?.getChildNodes()[0]
        //@ts-ignore
        ?.getChildNodes()[0]?.text

      if (method.parameters) {
        openApi.components.schemas = {
          ...openApi.components.schemas,
          ...createSchema(generator, method.parameters).components.schemas,
        }
      }

      openApi.components.schemas = {
        ...openApi.components.schemas,
        ...createSchema(generator, method.response).components.schemas,
      }
      methods.push(method as RestMethod)
    }

    for (const method of methods) {
      console.log(`${method.operationId}(args: ${method.parameters}) => Promise<${method.response}>`)
      //@ts-ignore
      openApi.paths['/' + method.operationId] = {
        post: {
          description: method.description || '',
          operationId: method.operationId,
          parameters: getParametersSchema(method.parameters),
          responses: {
            200: {
              description: method.description || '',
              content: {
                'application/json': {
                  schema: getResponseSchema(method.response),
                },
              },
            },
          },
        },
      }
    }
  }
}

console.log('Writing ' + outputFile)
writeFileSync(
  outputFile,
  "import { OpenAPIV3 } from 'openapi-types'\nexport const openApiSchema: OpenAPIV3.Document = " +
    JSON.stringify(openApi, null, 2),
)
