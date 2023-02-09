import { IAgent } from '@veramo/core-types'
import { Request, Response, NextFunction, Router, json } from 'express'
import Debug from 'debug'

interface RequestWithAgent extends Request {
  agent?: IAgent
}

/**
 * @public
 */
export interface AgentRouterOptions {
  /**
   * List of exposed methods
   */
  exposedMethods: Array<string>
}

/**
 * Creates a router that exposes {@link @veramo/core#Agent} methods remotely.
 *
 * This can be used by {@link @veramo/remote-client#AgentRestClient | AgentRestClient} to instantiate the methods of
 * this agent on the client.
 *
 * @param options - Initialization option
 * @returns Expressjs router
 *
 * @public
 */
export const AgentRouter = (options: AgentRouterOptions): Router => {
  const router = Router()
  router.use(json({ limit: '10mb' }))

  for (const exposedMethod of options.exposedMethods) {
    Debug('veramo:remote-server:initializing')(exposedMethod)

    router.post('/' + exposedMethod, async (req: RequestWithAgent, res: Response, next: NextFunction) => {
      if (!req.agent) throw Error('Agent not available')
      try {
        const result = await req.agent.execute(exposedMethod, req.body)
        res.status(200).json(result)
      } catch (e: any) {
        if (e.name === 'ValidationError') {
          res.status(400).json({
            name: 'ValidationError',
            message: e.message,
            method: e.method,
            path: e.path,
            code: e.code,
            description: e.description,
          })
        } else {
          res.status(500).json({ error: e.message })
        }
      }
    })
  }

  return router
}
