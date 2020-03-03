import { Core, AbstractMessageValidator, Message } from 'daf-core'
import { verifyJWT, decodeJWT } from 'did-jwt'
import Debug from 'debug'
const debug = Debug('daf:did-jwt:message-validator')

export class MessageValidator extends AbstractMessageValidator {
  async validate(message: Message, core: Core): Promise<Message> {
    try {
      const decoded = decodeJWT(message.raw)
      const audience = decoded.payload.aud
      const verified = await verifyJWT(message.raw, { resolver: core.didResolver, audience })
      debug('Message.raw is a valid JWT')

      message.transform({
        raw: message.raw,
        data: verified.payload,
        meta: { type: decoded.header.typ, id: decoded.header.alg },
      })
    } catch (e) {
      debug(e.message)
    }

    return super.validate(message, core)
  }
}
