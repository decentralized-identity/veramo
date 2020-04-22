import { EventEmitter } from 'events'
import { DIDDocument } from 'did-resolver'
import { IdentityManager } from './identity/identity-manager'
import { AbstractIdentityProvider } from './identity/abstract-identity-provider'
import { ServiceManager, LastMessageTimestampForInstance, ServiceEventTypes } from './service/service-manager'
import { ServiceControllerDerived } from './service/abstract-service-controller'
import { MessageHandler } from './message/abstract-message-handler'
import { ActionHandler } from './action/action-handler'
import { Action } from './types'
import { Message, MetaData } from './entities/message'
import { Connection } from 'typeorm'

import Debug from 'debug'
const debug = Debug('daf:agent')

export const EventTypes = {
  validatedMessage: 'validatedMessage',
  savedMessage: 'savedMessage',
  error: 'error',
}

export interface Resolver {
  resolve(did: string): Promise<DIDDocument | null>
}

interface Config {
  dbConnection?: Promise<Connection>
  didResolver: Resolver
  identityProviders: AbstractIdentityProvider[]
  serviceControllers?: ServiceControllerDerived[]
  messageHandler?: MessageHandler
  actionHandler?: ActionHandler
}

export class Agent extends EventEmitter {
  readonly dbConnection: Promise<Connection>
  public identityManager: IdentityManager
  public didResolver: Resolver
  private serviceManager: ServiceManager
  private messageHandler?: MessageHandler
  private actionHandler?: ActionHandler

  constructor(config: Config) {
    super()
    this.dbConnection = config.dbConnection || null

    this.identityManager = new IdentityManager({
      identityProviders: config.identityProviders,
    })

    this.didResolver = config.didResolver

    this.serviceManager = new ServiceManager({
      controllers: config.serviceControllers || [],
      didResolver: this.didResolver,
    })

    this.messageHandler = config.messageHandler

    this.actionHandler = config.actionHandler
  }

  async setupServices() {
    const identities = await this.identityManager.getIdentities()
    await this.serviceManager.setupServices(identities)
  }

  async listen() {
    debug('Listening for new messages')
    this.serviceManager.on(ServiceEventTypes.NewMessages, this.handleServiceMessages.bind(this))
    this.serviceManager.listen()
  }

  async getMessagesSince(ts: LastMessageTimestampForInstance[]): Promise<Message[]> {
    const rawMessages = await this.serviceManager.getMessagesSince(ts)
    return this.handleServiceMessages(rawMessages)
  }

  private async handleServiceMessages(messages: Message[]): Promise<Message[]> {
    const result: Message[] = []
    for (const message of messages) {
      try {
        const validMessage = await this.handleMessage({
          raw: message.raw,
          metaData: message.metaData,
        })
        result.push(validMessage)
      } catch (e) {}
    }

    return result
  }

  public async handleMessage({
    raw,
    metaData,
    save = true,
  }: {
    raw: string
    metaData?: MetaData[]
    save?: boolean
  }): Promise<Message> {
    debug('Handle message %o', { raw, metaData, save })
    if (!this.messageHandler) {
      return Promise.reject('Message handler not provided')
    }

    try {
      const message = await this.messageHandler.handle(new Message({ raw, metaData }), this)
      if (message.isValid()) {
        debug('Emitting event', EventTypes.validatedMessage)
        this.emit(EventTypes.validatedMessage, message)
      }

      debug('Validated message %o', message)
      if (save) {
        await (await this.dbConnection).getRepository(Message).save(message)
        debug('Emitting event', EventTypes.savedMessage)
        this.emit(EventTypes.savedMessage, message)
      }
      return message
    } catch (error) {
      this.emit(EventTypes.error, error)
      return Promise.reject(error)
    }
  }

  public async handleAction(action: Action): Promise<any> {
    if (!this.actionHandler) {
      return Promise.reject('Action handler not provided')
    }
    debug('Handle action %o', action)
    return this.actionHandler.handleAction(action, this)
  }
}
