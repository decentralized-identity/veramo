import { AbstractMessageHandler, Message, IAgentContext, IResolveDid } from 'daf-core'
import { verifyJWT, decodeJWT } from 'did-jwt'
import Debug from 'debug'
const debug = Debug('daf:did-jwt:message-handler')

export type IContext = IAgentContext<IResolveDid>

export class JwtMessageHandler extends AbstractMessageHandler {
  async handle(message: Message, context: IContext): Promise<Message> {
    if (message.raw) {
      try {
        const decoded = decodeJWT(message.raw)
        const audience = Array.isArray(decoded.payload.aud) ? decoded.payload.aud[0] : decoded.payload.aud
        const resolver = { resolve: (didUrl: string) => context.agent.resolveDid({ didUrl }) }
        const verified = await verifyJWT(message.raw, { resolver, audience })
        debug('Message.raw is a valid JWT')
        message.addMetaData({ type: decoded.header.typ, value: decoded.header.alg })
        message.data = verified.payload
      } catch (e) {
        debug(e.message)
      }
    }

    return super.handle(message, context)
  }
}
