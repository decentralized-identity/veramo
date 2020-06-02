import { EventEmitter } from 'events'
import { Message, MetaData } from '../entities/message'
import { AbstractMessageHandler } from './abstract-message-handler'
import { Connection } from 'typeorm'
import { IAgentPlugin, TMethodMap, IContext } from '../agent'

import Debug from 'debug'
const debug = Debug('daf:handle-message')

export const EventTypes = {
  validatedMessage: 'validatedMessage',
  savedMessage: 'savedMessage',
  error: 'error',
}

type THandleMessageArgs = {
  raw: string
  metaData?: MetaData[]
  save?: boolean
}

export interface IAgentHandleMessage {
  handleMessage?: (args: THandleMessageArgs) => Promise<Message>
}

export class HandleMessage extends EventEmitter implements IAgentPlugin {
  readonly methods: TMethodMap
  private dbConnection: Promise<Connection>
  private messageHandler: AbstractMessageHandler

  constructor(options: { dbConnection: Promise<Connection>; messageHandlers: AbstractMessageHandler[] }) {
    super()
    this.dbConnection = options.dbConnection

    for (const messageHandler of options.messageHandlers) {
      if (!this.messageHandler) {
        this.messageHandler = messageHandler
      } else {
        this.messageHandler.setNext(messageHandler)
      }
    }

    this.handleMessage = this.handleMessage.bind(this)
    this.methods = {
      handleMessage: this.handleMessage,
    }
  }

  public async handleMessage(args: THandleMessageArgs, context: IContext): Promise<Message> {
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
        await (await this.dbConnection).getRepository(Message).save(message)
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
