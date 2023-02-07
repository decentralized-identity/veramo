import { Router } from 'express'
import { getOpenApiSchema } from '@veramo/remote-client'
import { RequestWithAgent } from './request-agent-router.js'

/**
 * @public
 */
export interface ApiSchemaRouterOptions {
  /**
   * List of exposed methods
   */
  exposedMethods?: Array<string>

  /**
   * Base path
   */
  basePath: string

  /**
   * Security scheme
   * @example
   * ```
   * 'bearer'
   * ```
   */
  securityScheme?: string

  /**
   * Name used in OpenAPI schema
   */
  apiName?: string

  /**
   * Version used in OpenAPI schema
   */
  apiVersion?: string
}

/**
 * Creates a router that exposes {@link @veramo/core#Agent} OpenAPI schema
 *
 * @param options - Initialization option
 * @returns Expressjs router
 *
 * @public
 */
export const ApiSchemaRouter = (options: ApiSchemaRouterOptions): Router => {
  const router = Router()

  router.get('/', (req: RequestWithAgent, res) => {
    if (req.agent) {
      const openApiSchema = getOpenApiSchema(
        req.agent,
        '',
        options.exposedMethods || req.agent?.availableMethods(),
        options.apiName,
        options.apiVersion,
      )
      const url = (req.headers['x-forwarded-proto'] || req.protocol) + '://' + req.hostname + options.basePath
      openApiSchema.servers = [{ url }]

      if (options.securityScheme && openApiSchema.components) {
        openApiSchema.components.securitySchemes = {
          auth: { type: 'http', scheme: options.securityScheme },
        }
        openApiSchema.security = [{ auth: [] }]
      }

      res.json(openApiSchema)
    } else {
      res.status(500).json({ error: 'Agent not available' })
    }
  })

  return router
}
