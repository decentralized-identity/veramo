import { Resolver, DIDDocument } from 'did-resolver'
import { Issuer } from './identity-manager'
import { RawMessage } from './types'

export interface ServiceControllerOptions {
  config: any
  issuer: Issuer
  didDoc: DIDDocument
  onRawMessage: (rawMessage: RawMessage) => void
}

export interface ServiceInstanceId {
  sourceType: string
  did: string
}

export interface LastMessageTimestamp extends ServiceInstanceId {
  timestamp: number
}

export declare class ServiceController {
  constructor(options: ServiceControllerOptions)
  sync: (since: number) => Promise<void>
  init: () => Promise<boolean>
  instanceId: () => ServiceInstanceId
}

export type ServiceControllerWithConfig = {
  controller: typeof ServiceController
  config: any
}

interface Options {
  didResolver: Resolver
  serviceControllersWithConfig: ServiceControllerWithConfig[]
  onRawMessage: (rawMessage: RawMessage) => void
}

export class ServiceManager {
  private serviceControllersWithConfig: ServiceControllerWithConfig[]
  private onRawMessage: (rawMessage: RawMessage) => void
  private serviceControllers: ServiceController[]
  private didResolver: Resolver

  constructor(options: Options) {
    this.serviceControllersWithConfig = options.serviceControllersWithConfig
    this.onRawMessage = options.onRawMessage
    this.serviceControllers = []
    this.didResolver = options.didResolver
  }

  async configureServices(issuers: Issuer[]) {
    for (const issuer of issuers) {
      const didDoc = await this.didResolver.resolve(issuer.did)
      if (didDoc !== null) {
        for (const { controller, config } of this
          .serviceControllersWithConfig) {
          this.serviceControllers.push(
            new controller({
              config,
              issuer,
              didDoc,
              onRawMessage: this.onRawMessage,
            }),
          )
        }
      }
    }
  }

  async initServices() {
    for (const serviceController of this.serviceControllers) {
      await serviceController.init()
    }
  }

  async syncServices(lastMessageTimestamps: LastMessageTimestamp[]) {
    for (const serviceController of this.serviceControllers) {
      const instanceId = serviceController.instanceId()
      const lastMessage = lastMessageTimestamps.find(
        item =>
          item.did === instanceId.did &&
          item.sourceType === instanceId.sourceType,
      )
      let since = lastMessage ? lastMessage.timestamp : 0
      await serviceController.sync(since)
    }
  }
}
