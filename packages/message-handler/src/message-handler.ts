import {
  IDataStore,
  IAgentPlugin,
  IAgentContext,
  IMessageHandler,
  IHandleMessageArgs,
  CoreEvents,
  IMessage,
} from '@veramo/core-types'
import { schema } from '@veramo/core-types'
import { Message } from './message.js'
import { AbstractMessageHandler } from './abstract-message-handler.js'

import Debug from 'debug'

const debug = Debug('veramo:message-handler')

export const EventTypes = {
  validatedMessage: 'validatedMessage',
  savedMessage: 'savedMessage',
  error: CoreEvents.error,
}

/**
 * A Veramo agent plugin that implements {@link @veramo/core-types#IMessageHandler | IMessageHandler} methods.
 *
 * This plugin is meant to chain together multiple other {@link @veramo/core-types#IMessageHandler | IMessageHandler}
 * implementations.
 *
 * When handling a message, the message is passed from one handler to the next, and each handler in
 * the chain can decide if it is able to interpret the message.
 *
 * If the message can be processed by a handler it is returned as an {@link @veramo/core-types#IMessage | IMessage}.
 * If the message cannot be processed by any of the handlers, an error is thrown.
 *
 * @public
 */
export class MessageHandler implements IAgentPlugin {
  /**
   * Plugin methods
   * @public
   */
  readonly methods: IMessageHandler
  readonly schema = schema.IMessageHandler
  private messageHandler?: AbstractMessageHandler

  constructor(options: { messageHandlers: AbstractMessageHandler[] }) {
    for (const messageHandler of options.messageHandlers) {
      if (!this.messageHandler) {
        this.messageHandler = messageHandler
      } else {
        let lastHandler = this.messageHandler
        while (lastHandler.nextMessageHandler !== undefined) {
          lastHandler = lastHandler.nextMessageHandler
        }
        lastHandler.setNext(messageHandler)
      }
    }

    this.handleMessage = this.handleMessage.bind(this)
    this.methods = {
      handleMessage: this.handleMessage,
    }
  }

  /** {@inheritDoc @veramo/core-types#IMessageHandler.handleMessage} */
  public async handleMessage(
    args: IHandleMessageArgs,
    context: IAgentContext<IDataStore>,
  ): Promise<IMessage> {
    const { raw, metaData, save } = args
    debug('%o', { raw, metaData, save })
    if (!this.messageHandler) {
      return Promise.reject(new Error('Message handler not provided'))
    }

    try {
      const message = await this.messageHandler.handle(new Message({ raw, metaData }), context)
      if (message.isValid()) {
        debug('Emitting event', EventTypes.validatedMessage)
        context.agent.emit(EventTypes.validatedMessage, message)
      }

      debug('Validated message %o', message)
      if (save) {
        await context.agent.dataStoreSaveMessage({ message })
        debug('Emitting event', EventTypes.savedMessage)
        context.agent.emit(EventTypes.savedMessage, message)
      }
      return message
    } catch (error) {
      debug('Error', error)
      context.agent.emit(EventTypes.error, error)
      return Promise.reject(error)
    }
  }
}
