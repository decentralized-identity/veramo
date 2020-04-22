import { Agent, AbstractMessageHandler, Message, Identity } from 'daf-core'
import { blake2bHex } from 'blakejs'

import Debug from 'debug'
const debug = Debug('daf:daf:selective-disclosure:message-handler')

export const MessageTypes = {
  sdr: 'sdr',
}

export class SdrMessageHandler extends AbstractMessageHandler {
  async handle(message: Message, agent: Agent): Promise<Message> {
    const meta = message.getLastMetaData()

    if (
      meta?.type === 'JWT' &&
      meta?.value === 'ES256K-R' &&
      message.data.type == MessageTypes.sdr &&
      message.data.claims
    ) {
      debug('JWT type is', MessageTypes.sdr)

      message.id = blake2bHex(message.raw)
      message.type = MessageTypes.sdr
      message.from = new Identity()
      message.from.did = message.data.iss

      message.replyTo = Array.isArray(message.data.replyTo) ? message.data.replyTo : [message.data.replyTo]
      message.replyUrl = message.data.replyUrl

      if (message.data.subject) {
        const to = new Identity()
        to.did = message.data.subject
        message.to = to
      }

      message.threadId = message.data.tag
      message.createdAt = this.timestampToDate(message.data.nbf || message.data.iat)

      if (
        message.data.credentials &&
        Array.isArray(message.data.credentials) &&
        message.data.credentials.length > 0
      ) {
        debug('Verifying included credentials')
        message.credentials = []
        for (const raw of message.data.credentials) {
          try {
            const tmpMessage = await agent.handleMessage({ raw, save: false })
            if (tmpMessage.credentials) {
              message.credentials = [...message.credentials, ...tmpMessage.credentials]
            }
          } catch (e) {
            // Unsupported message type, or some other error
            debug(e)
          }
        }
      }
      return message
    }

    return super.handle(message, agent)
  }

  private timestampToDate(timestamp: number): Date {
    const date = new Date(0)
    date.setUTCSeconds(timestamp)
    return date
  }
}
