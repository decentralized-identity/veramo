/**
 * {@link https://expressjs.com | Express} router for exposing `daf-rest` OpenAPI schema
 *
 * @example
 * ```typescript
 * import express from 'express'
 * import { agent } from './agent'
 * import { AgentRouter } from 'daf-express'
 *
 * const agentRouter = AgentRouter({
 *   getAgentForRequest: async req => agent,
 *   exposedMethods: agent.availableMethods()
 * })
 *
 * const app = express()
 * app.use('/agent', agentRouter)
 * app.listen(3002)
 * ```
 *
 * @packageDocumentation
 */

import { IAgent } from 'daf-core'
import { Request, Response, NextFunction, Router, json } from 'express'
import { supportedMethods, openApiSchema } from 'daf-rest'
import Debug from 'debug'

interface RequestWithAgent extends Request {
  agent?: IAgent
}

/**
 * @public
 */
export interface AgentRouterOptions {
  /**
   * Function that returns configured agent for specific request
   */
  getAgentForRequest: (req: Request) => Promise<IAgent>

  /**
   * List of exposed methods
   */
  exposedMethods: Array<string>

  /**
   * List of extra methods
   */
  extraMethods?: Array<string>

  /**
   * If set to `true`, router will serve OpenAPI schema JSON on `/` route
   */
  serveSchema?: boolean
}

/**
 * Creates a router that exposes {@link daf-core#Agent} methods
 *
 * @param options - Initialization option
 * @returns Expressjs router
 */
export const AgentRouter = (options: AgentRouterOptions): Router => {
  const router = Router()
  router.use(json())
  router.use(async (req: RequestWithAgent, res, next) => {
    req.agent = await options.getAgentForRequest(req)
    next()
  })

  const allMethods: Array<string> = supportedMethods.concat(options.extraMethods ? options.extraMethods : [])

  const publicApi = { ...openApiSchema }
  publicApi.paths = {}

  for (const exposedMethod of options.exposedMethods) {
    if (!allMethods.includes(exposedMethod)) throw Error('Method not supported: ' + exposedMethod)
    Debug('daf:express:initializing')(exposedMethod)

    publicApi.paths['/' + exposedMethod] = openApiSchema.paths['/' + exposedMethod]

    router.post('/' + exposedMethod, async (req: RequestWithAgent, res: Response, next: NextFunction) => {
      if (!req.agent) throw Error('Agent not available')
      try {
        const result = await req.agent.execute(exposedMethod, req.body)
        res.status(200).json(result)
      } catch (e) {
        res.status(500).json({ error: e.message })
      }
    })
  }

  if (options.serveSchema) {
    router.get('/', (req, res) => {
      res.json(publicApi)
    })
  }

  return router
}
