import { EventEmitter } from 'events'
import { DIDDocument } from 'did-resolver'
import { IdentityManager, IdentityController } from './identity/identity-manager'
import { ServiceManager, LastMessageTimestampForInstance, ServiceEventTypes } from './service/service-manager'
import { ServiceControllerDerived } from './service/abstract-service-controller'
import { MessageValidator } from './message/message-validator'
import { ActionHandler } from './action/action-handler'
import { Action } from './types'
import { EncryptionKeyManager } from './encryption-manager'
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
  identityControllers: IdentityController[]
  serviceControllers: ServiceControllerDerived[]
  messageValidator: MessageValidator
  actionHandler?: ActionHandler
  encryptionKeyManager?: EncryptionKeyManager
}

export class Core extends EventEmitter {
  public identityManager: IdentityManager
  public encryptionKeyManager?: EncryptionKeyManager
  public didResolver: Resolver
  private serviceManager: ServiceManager
  private messageValidator: MessageValidator
  private actionHandler?: ActionHandler

  constructor(config: Config) {
    super()

    this.identityManager = new IdentityManager({
      identityControllers: config.identityControllers,
    })

    this.encryptionKeyManager = config.encryptionKeyManager

    this.didResolver = config.didResolver

    this.serviceManager = new ServiceManager({
      controllers: config.serviceControllers,
      didResolver: this.didResolver,
    })

    this.messageValidator = config.messageValidator

    this.actionHandler = config.actionHandler
  }

  async setupServices() {
    const issuers = await this.identityManager.listIssuers()
    await this.serviceManager.setupServices(issuers)
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
    return Promise.reject('Unsupported message type')
  }

  public async handleAction(action: Action): Promise<any> {
    if (this.actionHandler) {
      return this.actionHandler.handleAction(action, this)
    } else {
      return Promise.reject('No action handler')
    }
  }
}
