import { IAgentContext } from '@veramo/core-types'
import { Message } from './message.js'
import Debug from 'debug'

const debug = Debug('veramo:message-handler')
export const unsupportedMessageTypeError = new Error('Unsupported message type')

/**
 * An abstract class for creating {@link @veramo/message-handler#MessageHandler} plugins
 * @public
 */
export abstract class AbstractMessageHandler {
  public nextMessageHandler?: AbstractMessageHandler

  public setNext(messageHandler: AbstractMessageHandler): AbstractMessageHandler {
    this.nextMessageHandler = messageHandler
    return messageHandler
  }

  public async handle(message: Message, context: IAgentContext<{}>): Promise<Message> {
    if (this.nextMessageHandler) return this.nextMessageHandler.handle(message, context)
    debug("can't handle message: ", message)
    return Promise.reject(unsupportedMessageTypeError)
  }
}
