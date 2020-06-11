import { Message } from '../message'
import { IContext, IMessage } from '../types'

export interface MessageHandler {
  setNext(messageHandler: MessageHandler): MessageHandler
  handle: (message: Message, context: IContext) => Promise<Message>
}

export const unsupportedMessageTypeError = 'Unsupported message type'

export abstract class AbstractMessageHandler implements MessageHandler {
  public nextMessageHandler?: MessageHandler

  public setNext(messageHandler: MessageHandler): MessageHandler {
    this.nextMessageHandler = messageHandler
    return messageHandler
  }

  public async handle(message: Message, context: IContext): Promise<Message> {
    if (this.nextMessageHandler) {
      return this.nextMessageHandler.handle(message, context)
    }
    return Promise.reject(unsupportedMessageTypeError)
  }
}
