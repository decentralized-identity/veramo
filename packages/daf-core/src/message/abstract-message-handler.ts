import { Message } from '../entities/message'
import { Agent } from '../agent'

export interface MessageHandler {
  setNext(messageHandler: MessageHandler): MessageHandler
  handle: (message: Message, agent: Agent) => Promise<Message>
}

export const unsupportedMessageTypeError = 'Unsupported message type'

export abstract class AbstractMessageHandler implements MessageHandler {
  public nextMessageHandler?: MessageHandler

  public setNext(messageHandler: MessageHandler): MessageHandler {
    this.nextMessageHandler = messageHandler
    return messageHandler
  }

  public async handle(message: Message, agent: Agent): Promise<Message> {
    if (this.nextMessageHandler) {
      return this.nextMessageHandler.handle(message, agent)
    }
    return Promise.reject(unsupportedMessageTypeError)
  }
}
