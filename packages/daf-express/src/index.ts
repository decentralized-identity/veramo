import { IAgent } from 'daf-core'
import { Request, Response, NextFunction, Router, json } from 'express'
import { supportedMethods, IAgentRESTMethod } from 'daf-rest'
import Debug from 'debug'

interface RequestWithAgent extends Request {
  agent?: IAgent
}

export const AgentRouter = (options: {
  getAgentForRequest: (req: Request) => Promise<IAgent>
  exposedMethods: string[]
  overrides?: Record<string, IAgentRESTMethod>
}): Router => {
  const router = Router()
  router.use(json())
  router.use(async (req: RequestWithAgent, res, next) => {
    req.agent = await options.getAgentForRequest(req)
    next()
  })

  const allMethods: Record<string, IAgentRESTMethod> = { ...supportedMethods, ...options.overrides }

  for (const exposedMethod of options.exposedMethods) {
    const method = allMethods[exposedMethod]
    if (!method) throw Error('Method not supported: ' + exposedMethod)
    Debug('daf:express:initializing')(exposedMethod)

    switch (method.type) {
      case 'POST':
        router.post(method.path, async (req: RequestWithAgent, res: Response, next: NextFunction) => {
          if (!req.agent) throw Error('Agent not available')
          try {
            const result = await req.agent.execute(exposedMethod, req.body)
            res.status(200).json(result)
          } catch (e) {
            res.status(500).json({ error: e.message })
          }
        })
        break
      // TODO: handle GET
    }
  }

  return router
}
