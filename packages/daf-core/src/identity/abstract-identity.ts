import { AbstractKey, KeyType } from './abstract-key-management-system'
export abstract class AbstractIdentity {
  abstract identityProviderType: string
  abstract did: string
  abstract keyByType(type: KeyType): Promise<AbstractKey>
  abstract keyById(id: string): Promise<AbstractKey>
}

type AbstractIdentityClass = typeof AbstractIdentity
export interface IdentityDerived extends AbstractIdentityClass {}
