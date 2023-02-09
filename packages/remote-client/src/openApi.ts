import { OpenAPIV3 } from 'openapi-types'
import { IAgent } from '@veramo/core-types'

/**
 * This method can be used to generate an OpenAPIv3 schema to describe how the methods of a Veramo agent can be called
 * remotely.
 *
 * @param agent - The agent whose schema needs to be interpreted.
 * @param basePath - The base URL
 * @param exposedMethods - The list of method names available through this schema
 * @param name - The name of the agent
 * @param version - The version of the agent
 *
 * @public
 */
export const getOpenApiSchema = (
  agent: IAgent,
  basePath: string,
  exposedMethods: Array<string>,
  name?: string,
  version?: string,
): OpenAPIV3.Document => {
  const agentSchema = agent.getSchema()

  const paths: OpenAPIV3.PathsObject = {}

  const schemas = {}
  const xMethods: Record<string, any> = {}

  for (const method of exposedMethods) {
    const pathItemObject: OpenAPIV3.PathItemObject = {
      post: {
        operationId: method,
        description: agentSchema.components.methods[method].description,
        requestBody: {
          content: {
            'application/json': {
              schema: agentSchema.components.methods[method].arguments,
            },
          },
        },
        responses: {
          200: {
            // TODO returnType description
            description: agentSchema.components.methods[method].description,
            content: {
              'application/json; charset=utf-8': {
                schema: agentSchema.components.methods[method].returnType,
              },
            },
          },
          400: {
            description: 'Validation error',
            content: {
              'application/json; charset=utf-8': {
                schema: agentSchema.components.schemas.ValidationError,
              },
            },
          },
        },
      },
    }
    paths[basePath + '/' + method] = pathItemObject
    xMethods[method] = agentSchema.components.methods[method]
  }

  const openApi: OpenAPIV3.Document & { 'x-methods'?: Record<string, any> } = {
    openapi: '3.0.0',
    info: {
      title: name || 'DID Agent',
      version: version || '',
    },
    components: {
      schemas: agent.getSchema().components.schemas,
    },
    paths,
  }

  openApi['x-methods'] = xMethods

  return openApi
}
