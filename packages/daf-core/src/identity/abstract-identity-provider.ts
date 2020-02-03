import { EventEmitter } from 'events'
import { AbstractIdentity, ServiceEndpoint } from './abstract-identity'

export abstract class AbstractIdentityProvider extends EventEmitter {
  abstract type: string
  abstract description: string
  abstract createIdentity(): Promise<AbstractIdentity>
  abstract deleteIdentity(did: string): Promise<boolean>
  abstract getIdentities(): Promise<AbstractIdentity[]>
  abstract getIdentity(did: string): Promise<AbstractIdentity>

  exportIdentity(did: string): Promise<string> {
    return Promise.reject('Method importIdentity not implemented')
  }

  importIdentity(secret: string): Promise<AbstractIdentity> {
    return Promise.reject('Method importIdentity not implemented')
  }

  addPublicKey(did: string, type: string, proofPurpose?: string[]): Promise<string> {
    return Promise.reject('Method addPublicKey not implemented')
  }

  removePublicKey(did: string, keyId: string): Promise<boolean> {
    return Promise.reject('Method removePublicKey not implemented')
  }

  addService(did: string, service: ServiceEndpoint): Promise<any> {
    return Promise.reject('Method addService not implemented')
  }

  removeService(did: string, service: ServiceEndpoint): Promise<boolean> {
    return Promise.reject('Method removeService not implemented')
  }
}

type AbstractIdentityProviderClass = typeof AbstractIdentityProvider
export interface IdentityProviderDerived extends AbstractIdentityProviderClass {}
