import { EventEmitter } from 'events'
import { DIDDocument } from 'did-resolver'
import { IdentityManager, IdentityController } from './identity/identity-manager'
import { ServiceManager, ServiceControllerWithConfig, LastMessageTimestamp } from './service-manager'
import { MessageValidator } from './message/message-validator'
import { ActionHandler } from './action/action-handler'
import { Action } from './types'
import { EncryptionKeyManager } from './encryption-manager'
import { Message } from './message/message'

import Debug from 'debug'
const debug = Debug('core')

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
  serviceControllersWithConfig: ServiceControllerWithConfig[]
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
      serviceControllersWithConfig: config.serviceControllersWithConfig,
      validateMessage: this.validateMessage.bind(this),
      didResolver: this.didResolver,
    })

    this.messageValidator = config.messageValidator

    this.actionHandler = config.actionHandler
  }

  async startServices() {
    const issuers = await this.identityManager.listIssuers()
    await this.serviceManager.configureServices(issuers)
    await this.serviceManager.initServices()
  }

  async syncServices(lastMessageTimestamps: LastMessageTimestamp[]) {
    await this.serviceManager.syncServices(lastMessageTimestamps)
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
