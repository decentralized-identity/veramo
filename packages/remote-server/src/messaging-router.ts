import { IAgent, IMessageHandler, TAgent } from '@veramo/core'
import { text, Request, Router } from 'express'

interface RequestWithMessageHandler extends Request {
  agent?: TAgent<IMessageHandler>
}

/**
 * @public
 */
export interface MessagingRouterOptions {
  /**
   * Message metadata
   */
  metaData: {
    type: string
    value?: string
  }

  /**
   * Optional. true by default
   */
  save?: boolean
}

/**
 * Creates a router for handling incoming messages
 *
 * @param options - Initialization option
 * @returns Expressjs router
 */
export const MessagingRouter = (options: MessagingRouterOptions): Router => {
  const router = Router()
  router.use(text({ type: '*/*' }))
  router.post('/', async (req: RequestWithMessageHandler, res) => {
    try {
      const message = await req.agent?.handleMessage({
        raw: req.body as any as string,
        metaData: [options.metaData],
        save: typeof options.save === 'undefined' ? true : options.save,
      })

      if (message) {
        res.json({ id: message.id })
      }
    } catch (e: any) {
      console.log(e)
      res.send(e.message)
    }
  })

  return router
}
