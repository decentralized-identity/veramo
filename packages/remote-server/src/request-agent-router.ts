import { IAgent } from '@veramo/core'
import { Request, Router } from 'express'

export interface RequestWithAgent extends Request {
  agent?: IAgent
}

/**
 * @public
 */
export interface RequestWithAgentRouterOptions {
  /**
   * Function that returns configured agent for specific request
   */
  getAgentForRequest: (req: Request) => Promise<IAgent>
}

/**
 * Creates a router that adds veramo agent to the request object
 *
 * @param options - Initialization option
 * @returns Expressjs router
 */
export const RequestWithAgentRouter = (options: RequestWithAgentRouterOptions): Router => {
  const router = Router()
  router.use(async (req: RequestWithAgent, res, next) => {
    req.agent = await options.getAgentForRequest(req)
    next()
  })

  return router
}
