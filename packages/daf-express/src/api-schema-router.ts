import { IAgent, IIdentity, IIdentityManager, TAgent } from 'daf-core'
import { Request, Response, NextFunction, Router, json } from 'express'
import { getOpenApiSchema } from 'daf-rest'
import Debug from 'debug'

interface RequestWithAgentIdentityManager extends Request {
  agent?: TAgent<IIdentityManager>
}

interface RequestWithAgent extends Request {
  agent?: IAgent
}

/**
 * @public
 */
export interface ApiSchemaRouterOptions {
  /**
   * Function that returns configured agent for specific request
   */
  getAgentForRequest: (req: Request) => Promise<IAgent>

  /**
   * List of exposed methods
   */
  exposedMethods: Array<string>

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
}

/**
 * Creates a router that exposes {@link daf-core#Agent} OpenAPI schema
 *
 * @param options - Initialization option
 * @returns Expressjs router
 */
export const ApiSchemaRouter = (options: ApiSchemaRouterOptions): Router => {
  const router = Router()
  router.use(async (req: RequestWithAgent, res, next) => {
    req.agent = await options.getAgentForRequest(req)
    next()
  })

  router.get('/', (req: RequestWithAgent, res) => {
    if (req.agent) {
      const openApiSchema = getOpenApiSchema(req.agent, '', options.exposedMethods)
      const url = req.protocol + '://' + req.hostname + options.basePath
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
