import { Message } from '../entities/message'
import { Core } from '../core'

export interface MessageHandler {
  setNext(messageHandler: MessageHandler): MessageHandler
  handle: (message: Message, core: Core) => Promise<Message>
}

export const unsupportedMessageTypeError = 'Unsupported message type'

export abstract class AbstractMessageHandler implements MessageHandler {
  public nextMessageHandler?: MessageHandler

  public setNext(messageHandler: MessageHandler): MessageHandler {
    this.nextMessageHandler = messageHandler
    return messageHandler
  }

  public async handle(message: Message, core: Core): Promise<Message> {
    if (this.nextMessageHandler) {
      return this.nextMessageHandler.handle(message, core)
    }
    return Promise.reject(unsupportedMessageTypeError)
  }
}
