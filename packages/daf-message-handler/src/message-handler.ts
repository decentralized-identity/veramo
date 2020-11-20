import {
  IDataStore,
  IAgentPlugin,
  IAgentContext,
  IMessageHandler,
  IHandleMessageArgs,
  pluginCredential,
} from 'daf-core'
import { Message } from './message'
import { AbstractMessageHandler } from './abstract-message-handler'

import Debug from 'debug'
const debug = Debug('daf:message-handler')

export const EventTypes = {
  validatedMessage: 'validatedMessage',
  savedMessage: 'savedMessage',
  error: 'error',
}

/**
 * Agent plugin that provides {@link daf-core#IMessageHandler} methods
 */
export class MessageHandler implements IAgentPlugin {
  /**
   * Plugin methods
   * @public
   */
  readonly methods: IMessageHandler
  readonly schema = pluginCredential.credentialSubject.interfaces.IMessageHandler
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

  /** {@inheritDoc daf-core#IMessageHandler.handleMessage} */
  public async handleMessage(args: IHandleMessageArgs, context: IAgentContext<IDataStore>): Promise<Message> {
    const { raw, metaData, save } = args
    debug('%o', { raw, metaData, save })
    if (!this.messageHandler) {
      return Promise.reject('Message handler not provided')
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
