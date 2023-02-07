import { IAgent } from '@veramo/core-types'
import { Request, Router } from 'express'

export interface RequestWithAgent extends Request {
  agent?: IAgent
}

/**
 * @public
 */
export interface RequestWithAgentRouterOptions {
  /**
   * Optional. Pre-configured agent
   */
  agent?: IAgent

  /**
   * Optional. Function that returns a Promise that resolves to a configured agent for specific request
   */
  getAgentForRequest?: (req: Request) => Promise<IAgent>
}

/**
 * Creates an expressjs router that adds a Veramo agent to the request object.
 *
 * This is needed by all other routers provided by this package to be able to perform their functions.
 *
 * @param options - Initialization option
 * @returns Expressjs router
 *
 * @public
 */
export const RequestWithAgentRouter = (options: RequestWithAgentRouterOptions): Router => {
  const router = Router()
  router.use(async (req: RequestWithAgent, res, next) => {
    if (options.agent) {
      req.agent = options.agent
    } else if (options.getAgentForRequest) {
      req.agent = await options.getAgentForRequest(req)
    } else {
      throw Error('[RequestWithAgentRouter] agent or getAgentForRequest is required')
    }
    next()
  })

  return router
}
