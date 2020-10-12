/**
 * Provides a {@link daf-rest#AgentRestClient | plugin} for the {@link daf-core#Agent} that can proxy method execution over HTTPS using {@link daf-rest#openApiSchema | OpenAPI}
 *
 * @packageDocumentation
 */
import { IAgent } from 'daf-core'
import { OpenAPIV3 } from 'openapi-types'
export { AgentRestClient } from './client'

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
              'application/json': {
                schema: agentSchema.components.methods[method].returnType
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
      title: "DAF OpenAPI",
      version: ""
    },
    components:{
      schemas: agent.getSchema().components.schemas
    },
    paths
  }

  return openApi
}
