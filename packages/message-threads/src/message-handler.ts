import { IAgentContext, IMessageHandler } from '@veramo/core'
import { Message, AbstractMessageHandler } from '@veramo/message-handler'
import { blake2bHex } from 'blakejs'

import Debug from 'debug'
const debug = Debug('veramo:selective-disclosure:message-handler')

export const MessageTypes = {
  chat: 'veramo.io-chat-v1',
}

export class DIDCommChatMessageHandler extends AbstractMessageHandler {
  async handle(message: Message, context: IAgentContext<IMessageHandler>): Promise<Message> {
    if (message.type == MessageTypes.chat) {
      debug('Message type is', MessageTypes.chat)
      const raw = JSON.parse(message.raw as string)

      message.threadId = message.id
      message.id = blake2bHex(message.raw)
      message.from = raw.from
      message.to = raw.to
      message.createdAt = this.timestampToDate(raw.iat).toISOString()
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
