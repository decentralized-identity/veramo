import { Core, AbstractMessageValidator, Message, Identity } from 'daf-core'

import Debug from 'debug'
const debug = Debug('daf:daf:selective-disclosure:message-validator')

export const MessageTypes = {
  sdr: 'sdr',
}

export class MessageValidator extends AbstractMessageValidator {
  async validate(message: Message, core: Core): Promise<Message> {
    const meta = message.getLastMetaData()

    if (
      meta?.type === 'JWT' &&
      meta?.value === 'ES256K-R' &&
      message.data.type == MessageTypes.sdr &&
      message.data.claims
    ) {
      debug('JWT type is', MessageTypes.sdr)

      message.type = MessageTypes.sdr
      message.from = new Identity()
      message.from.did = message.data.iss

      const to = new Identity()
      to.did = message.data.sub
      message.to = to
      message.threadId = message.data.tag
      message.createdAt = this.timestampToDate(message.data.nbf || message.data.iat)
      return message
    }

    return super.validate(message, core)
  }

  private timestampToDate(timestamp: number): Date {
    const date = new Date(0)
    date.setUTCSeconds(timestamp)
    return date
  }
}
