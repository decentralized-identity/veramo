import { EventEmitter } from 'events'
import { AbstractIdentity } from './abstract-identity'

export abstract class AbstractIdentityProvider extends EventEmitter {
  abstract type: string
  abstract description: string
  abstract createIdentity: () => Promise<AbstractIdentity>
  abstract importIdentity: (secret: string) => Promise<AbstractIdentity>
  abstract exportIdentity: (did: string) => Promise<string>
  abstract deleteIdentity: (did: string) => Promise<boolean>
  abstract getIdentities: () => Promise<AbstractIdentity[]>
  abstract getIdentity: (did: string) => Promise<AbstractIdentity>
}

type AbstractIdentityProviderClass = typeof AbstractIdentityProvider
export interface IdentityProviderDerived extends AbstractIdentityProviderClass {}
