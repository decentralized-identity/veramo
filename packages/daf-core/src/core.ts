import { EventEmitter } from 'events'
import { DIDDocument } from 'did-resolver'
import { IdentityManager } from './identity/identity-manager'
import { AbstractIdentityProvider } from './identity/abstract-identity-provider'
import { ServiceManager, LastMessageTimestampForInstance, ServiceEventTypes } from './service/service-manager'
import { ServiceControllerDerived } from './service/abstract-service-controller'
import { MessageValidator, unsupportedMessageTypeError } from './message/abstract-message-validator'
import { ActionHandler } from './action/action-handler'
import { Action } from './types'
import { Message } from './message/message'

import Debug from 'debug'
const debug = Debug('daf:core')

export const EventTypes = {
  validatedMessage: 'validatedMessage',
  error: 'error',
}

export interface Resolver {
  resolve(did: string): Promise<DIDDocument | null>
}

interface Config {
  didResolver: Resolver
  identityProviders: AbstractIdentityProvider[]
  serviceControllers: ServiceControllerDerived[]
  messageValidator: MessageValidator
  actionHandler?: ActionHandler
}

export class Core extends EventEmitter {
  public identityManager: IdentityManager
  public didResolver: Resolver
  private serviceManager: ServiceManager
  private messageValidator: MessageValidator
  private actionHandler?: ActionHandler

  constructor(config: Config) {
    super()

    this.identityManager = new IdentityManager({
      identityProviders: config.identityProviders,
    })

    this.didResolver = config.didResolver

    this.serviceManager = new ServiceManager({
      controllers: config.serviceControllers,
      didResolver: this.didResolver,
    })

    this.messageValidator = config.messageValidator

    this.actionHandler = config.actionHandler
  }

  async setupServices() {
    const identities = await this.identityManager.getIdentities()
    await this.serviceManager.setupServices(identities)
  }

  async listen() {
    debug('Listening for new messages')
    this.serviceManager.on(ServiceEventTypes.NewMessages, this.validateMessages.bind(this))
    this.serviceManager.listen()
  }

  async getMessagesSince(ts: LastMessageTimestampForInstance[]): Promise<Message[]> {
    const rawMessages = await this.serviceManager.getMessagesSince(ts)
    return this.validateMessages(rawMessages)
  }

  public async validateMessages(messages: Message[]): Promise<Message[]> {
    const result: Message[] = []
    for (const message of messages) {
      try {
        const validMessage = await this.validateMessage(message)
        result.push(validMessage)
      } catch (e) {}
    }

    return result
  }

  public async validateMessage(message: Message): Promise<Message> {
    debug('Raw message %O', message)
    try {
      const validatedMessage = await this.messageValidator.validate(message, this)
      if (validatedMessage.isValid()) {
        this.emit(EventTypes.validatedMessage, validatedMessage)
        return validatedMessage
      }
    } catch (error) {
      this.emit(EventTypes.error, error, message)
      return Promise.reject(error)
    }
    return Promise.reject(unsupportedMessageTypeError)
  }

  public async handleAction(action: Action): Promise<any> {
    if (this.actionHandler) {
      return this.actionHandler.handleAction(action, this)
    } else {
      return Promise.reject('No action handler')
    }
  }
}
