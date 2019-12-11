import { EventEmitter } from 'events'
import { Resolver } from '../core'
import { AbstractServiceController, ServiceControllerDerived } from './abstract-service-controller'
import { Issuer } from '../identity/identity-manager'
import { Message } from '../message/message'
import Debug from 'debug'
const debug = Debug('daf:service-manager')

export enum ServiceEventTypes {
  NewMessages = 'NewMessages',
}

export interface LastMessageTimestampForInstance {
  timestamp: number
  did: string
  type: string
  id: string
}

interface Options {
  controllers: ServiceControllerDerived[]
  didResolver: Resolver
}

export class ServiceManager extends EventEmitter {
  private controllerInstances: AbstractServiceController[]
  private controllers: ServiceControllerDerived[]
  private didResolver: Resolver

  constructor(options: Options) {
    super()
    this.controllerInstances = []
    this.controllers = options.controllers
    this.didResolver = options.didResolver
  }

  async setupServices(issuers: Issuer[]) {
    for (const issuer of issuers) {
      for (const controller of this.controllers) {
        const instance = new controller(issuer, this.didResolver)
        await instance.ready
        instance.on(ServiceEventTypes.NewMessages, this.onNewMessages)
        this.controllerInstances.push(instance)
      }
    }
  }

  private onNewMessages(messages: Message[]) {
    debug('onNewMessage kakakaka %O', messages)
    this.emit(ServiceEventTypes.NewMessages, messages)
  }

  listen() {
    for (const instance of this.controllerInstances) {
      instance.listen()
    }
  }

  async getMessagesSince(ts: LastMessageTimestampForInstance[]): Promise<Message[]> {
    let result: Message[] = []
    for (const instance of this.controllerInstances) {
      const { id, type, did } = instance.instanceId()
      const found = ts.find(i => i.did === did && i.id === id && i.type === type)
      let since = found ? found.timestamp : 0
      const messages = await instance.getMessagesSince(since)
      result = result.concat(messages)
    }
    return result
  }
}
