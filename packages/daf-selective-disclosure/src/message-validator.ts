import { Core, AbstractMessageValidator, Message } from 'daf-core'

import Debug from 'debug'
const debug = Debug('daf:sdr-validator')

export const MessageTypes = {
  sdr: 'sdr',
}

export class MessageValidator extends AbstractMessageValidator {
  async validate(message: Message, core: Core): Promise<Message> {
    const { type, id } = message.meta

    if (type === 'JWT' && id === 'ES256K-R' && message.data.type == MessageTypes.sdr && message.data.claims) {
      debug('JWT type is', MessageTypes.sdr)

      message.type = MessageTypes.sdr
      message.sender = message.data.iss
      message.receiver = message.data.sub
      message.threadId = message.data.tag
      message.timestamp = message.data.nbf || message.data.iat
      return message
    }

    return super.validate(message, core)
  }
}
