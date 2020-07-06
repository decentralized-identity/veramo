import { EventEmitter } from 'events'
import { AbstractIdentity } from './abstract-identity'

export abstract class AbstractIdentityProvider extends EventEmitter {
  abstract type: string
  abstract description: string
  abstract createIdentity(options?: any): Promise<AbstractIdentity>
  abstract deleteIdentity(did: string): Promise<boolean>
  abstract getIdentities(): Promise<AbstractIdentity[]>
  abstract getIdentity(did: string): Promise<AbstractIdentity>

  exportIdentity(did: string): Promise<string> {
    return Promise.reject('Method exportIdentity not implemented')
  }

  importIdentity(secret: string): Promise<AbstractIdentity> {
    return Promise.reject('Method importIdentity not implemented')
  }
}

type AbstractIdentityProviderClass = typeof AbstractIdentityProvider
export interface IdentityProviderDerived extends AbstractIdentityProviderClass {}
