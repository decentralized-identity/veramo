import { EventEmitter } from 'events'
import { Message } from './message'
import { IMetaData, IAgentDataStore, IAgentPlugin, TMethodMap, IContext, IAgentBase } from './types'
import { AbstractMessageHandler } from './abstract/abstract-message-handler'

import Debug from 'debug'
const debug = Debug('daf:message-handler')

export const EventTypes = {
  validatedMessage: 'validatedMessage',
  savedMessage: 'savedMessage',
  error: 'error',
}

type THandleMessageArgs = {
  raw: string
  metaData?: IMetaData[]
  save?: boolean
}

interface Context extends IContext {
  agent: Required<IAgentBase & IAgentDataStore>
}

export interface IAgentHandleMessage {
  handleMessage?: (args: THandleMessageArgs) => Promise<Message>
}

export class MessageHandler extends EventEmitter implements IAgentPlugin {
  readonly methods: TMethodMap
  private messageHandler?: AbstractMessageHandler

  constructor(options: { messageHandlers: AbstractMessageHandler[] }) {
    super()

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

  public async handleMessage(args: THandleMessageArgs, context: Context): Promise<Message> {
    const { raw, metaData, save } = args
    debug('%o', { raw, metaData, save })
    if (!this.messageHandler) {
      return Promise.reject('Message handler not provided')
    }

    try {
      const message = await this.messageHandler.handle(new Message({ raw, metaData }), context)
      if (message.isValid()) {
        debug('Emitting event', EventTypes.validatedMessage)
        this.emit(EventTypes.validatedMessage, message)
      }

      debug('Validated message %o', message)
      if (save) {
        await context.agent.dataStoreSaveMessage(message)
        debug('Emitting event', EventTypes.savedMessage)
        // this.emit(EventTypes.savedMessage, message)
      }
      return message
    } catch (error) {
      // this.emit(EventTypes.error, error)
      return Promise.reject(error)
    }
  }
}
