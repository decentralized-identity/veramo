import { AbstractMessageHandler, Message, IIdentity, IAgentBase, IAgentHandleMessage } from 'daf-core'
import { blake2bHex } from 'blakejs'

import Debug from 'debug'
const debug = Debug('daf:daf:selective-disclosure:message-handler')

export const MessageTypes = {
  sdr: 'sdr',
}

interface IContext {
  agent: IAgentBase & IAgentHandleMessage
}

export class SdrMessageHandler extends AbstractMessageHandler {
  async handle(message: Message, context: IContext): Promise<Message> {
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
      message.from = message.data.iss

      message.replyTo = Array.isArray(message.data.replyTo) ? message.data.replyTo : [message.data.replyTo]
      message.replyUrl = message.data.replyUrl

      if (message.data.subject) {
        message.to = message.data.subject
      }

      message.threadId = message.data.tag
      message.createdAt = this.timestampToDate(message.data.nbf || message.data.iat)

      if (
        message.data.credentials &&
        Array.isArray(message.data.credentials) &&
        message.data.credentials.length > 0
      ) {
        debug('Verifying included credentials')
        // FIXME
        // message.credentials = []
        // for (const raw of message.data.credentials) {
        //   try {
        //     const tmpMessage = await context.agent.handleMessage({ raw, save: false })
        //     if (tmpMessage.credentials) {
        //       message.credentials = [...message.credentials, ...tmpMessage.credentials]
        //     }
        //   } catch (e) {
        //     // Unsupported message type, or some other error
        //     debug(e)
        //   }
        // }
      }
      return message
    }

    return super.handle(message, context)
  }

  private timestampToDate(timestamp: number): Date {
    const date = new Date(0)
    date.setUTCSeconds(timestamp)
    return date
  }
}
