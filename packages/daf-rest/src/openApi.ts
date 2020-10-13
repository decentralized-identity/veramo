import { OpenAPIV3 } from 'openapi-types'
import { IAgent } from 'daf-core'

export const getOpenApiSchema = (agent: IAgent, basePath: string, exposedMethods: Array<string>): OpenAPIV3.Document => {
  const agentSchema = agent.getSchema()

  const paths: OpenAPIV3.PathsObject = {}

  const schemas = {}

  for (const method of exposedMethods) {
    const pathItemObject: OpenAPIV3.PathItemObject = {
      post: {
        operationId: method,
        description: agentSchema.components.methods[method].description,
        requestBody: {
          content: {
            'application/json': {
              schema: agentSchema.components.methods[method].arguments
            }
          }
        },
        responses: {
          200: {
            // TODO returnType description
            description: agentSchema.components.methods[method].description,
            content: {
              'application/json; charset=utf-8': {
                schema: agentSchema.components.methods[method].returnType
              }
            }
          },
          400: {
            description: "Validation error",
            content: {
              'application/json; charset=utf-8': {
                schema: agentSchema.components.schemas.ValidationError
              }
            }
          }
        }
      }
    }
    paths[basePath + '/' + method] = pathItemObject
  }

  const openApi: OpenAPIV3.Document = {
    openapi: "3.0.0",
    info: {
      title: "DID Agent",
      version: ""
    },
    components:{
      schemas: agent.getSchema().components.schemas
    },
    paths
  }

  return openApi
}
