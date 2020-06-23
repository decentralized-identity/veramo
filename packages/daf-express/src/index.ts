import { IAgent } from 'daf-core'
import { Request, Response, NextFunction } from 'express'
import { supportedMethods } from 'daf-rest'

export const AgentExpressMiddleware = (options: { agent: IAgent; methods: string[]; prefix: string }) => {
  const availableEndpoints = options.methods.map(method => options.prefix + supportedMethods[method].path)
  let methodPathMap: Record<string, string> = {}
  for (const method of options.methods) {
    methodPathMap[options.prefix + supportedMethods[method].path] = method
  }

  return async (req: Request, res: Response, next: NextFunction) => {
    if (availableEndpoints.includes(req.path)) {
      const method = methodPathMap[req.path]
      const result = await options.agent.execute(method, req.body)
      res.json(result)
    } else {
      next()
    }
  }
}
