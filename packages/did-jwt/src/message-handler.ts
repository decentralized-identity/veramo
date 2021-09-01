import { IAgentContext, IResolver } from '@veramo/core'
import { AbstractMessageHandler, Message } from '@veramo/message-handler'
import { verifyJWT, decodeJWT } from 'did-jwt'
import Debug from 'debug'
import { Resolvable } from 'did-resolver'
const debug = Debug('veramo:did-jwt:message-handler')

export type IContext = IAgentContext<IResolver>

/**
 * A plugin for {@link @veramo/message-handler#MessageHandler} that finds and verifies a JWT in a message.
 * @public
 */
export class JwtMessageHandler extends AbstractMessageHandler {
  async handle(message: Message, context: IContext): Promise<Message> {
    if (message.raw) {
      try {
        const decoded = decodeJWT(message.raw)
        const audience = Array.isArray(decoded.payload.aud) ? decoded.payload.aud[0] : decoded.payload.aud
        const resolver = { resolve: (didUrl: string) => context.agent.resolveDid({ didUrl }) } as Resolvable
        const verified = await verifyJWT(message.raw, { resolver, audience })
        debug('Message.raw is a valid JWT')
        message.addMetaData({ type: decoded.header.typ || 'JWT', value: decoded.header.alg })
        message.data = verified.payload
      } catch (e: any) {
        debug(e.message)
      }
    }

    return super.handle(message, context)
  }
}
