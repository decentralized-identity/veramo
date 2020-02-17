import { AbstractKey, KeyType } from './abstract-key-management-system'
import { AbstractIdentityController } from './abstract-identity-controller'
export abstract class AbstractIdentity {
  abstract did: string
  abstract identityProviderType: string
  abstract identityController: AbstractIdentityController
  abstract keyByType(type: KeyType): Promise<AbstractKey>
  abstract keyById(id: string): Promise<AbstractKey>
}

type AbstractIdentityClass = typeof AbstractIdentity
export interface IdentityDerived extends AbstractIdentityClass {}
