import { Message } from '../message'
import { IAgentContext } from '../types'

export const unsupportedMessageTypeError = 'Unsupported message type'

export abstract class AbstractMessageHandler {
  public nextMessageHandler?: AbstractMessageHandler

  public setNext(messageHandler: AbstractMessageHandler): AbstractMessageHandler {
    this.nextMessageHandler = messageHandler
    return messageHandler
  }

  public async handle(message: Message, context: IAgentContext<{}>): Promise<Message> {
    if (this.nextMessageHandler) {
      return this.nextMessageHandler.handle(message, context)
    }
    return Promise.reject(unsupportedMessageTypeError)
  }
}
