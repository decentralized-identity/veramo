import { IMessageHandler, TAgent } from '@veramo/core-types'
import { Request, Router, text } from 'express'

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
 * Creates a router for handling incoming messages.
 *
 * Messages posted to this router get sent to the `handleMessage` method of the associated agent where this is used.
 *
 * @param options - Initialization option
 * @returns Expressjs router
 *
 * @public
 */
export const MessagingRouter = (options: MessagingRouterOptions): Router => {
  const router = Router()
  router.use(text({ type: '*/*', limit: '10mb' }))
  router.post('/', async (req: RequestWithMessageHandler, res) => {
    try {
      const message = await req.agent?.handleMessage({
        raw: req.body as any as string,
        metaData: [options.metaData],
        save: typeof options.save === 'undefined' ? true : options.save,
      })

      const returnRouteResponse = message?.metaData?.find((v) => v.type === 'ReturnRouteResponse')
      if (returnRouteResponse && returnRouteResponse.value) {
        const returnMessage = JSON.parse(returnRouteResponse.value)
        res.contentType(returnMessage.contentType).json(returnMessage.message)
        req.agent?.emit('DIDCommV2Message-sent', returnMessage.id)
      } else if (message) {
        res.json({ id: message.id })
      }
    } catch (e: any) {
      console.error(e)
      res.status(400).send(e.message)
    }
  })

  return router
}
