import { Core, AbstractMessageHandler, Message } from 'daf-core'
import { verifyJWT, decodeJWT } from 'did-jwt'
import Debug from 'debug'
const debug = Debug('daf:did-jwt:message-handler')

export class JwtMessageHandler extends AbstractMessageHandler {
  async handle(message: Message, core: Core): Promise<Message> {
    try {
      const decoded = decodeJWT(message.raw)
      const audience = decoded.payload.aud
      const verified = await verifyJWT(message.raw, { resolver: core.didResolver, audience })
      debug('Message.raw is a valid JWT')
      message.addMetaData({ type: decoded.header.typ, value: decoded.header.alg })
      message.data = verified.payload
    } catch (e) {
      debug(e.message)
    }

    return super.handle(message, core)
  }
}
