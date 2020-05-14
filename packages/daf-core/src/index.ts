export { Agent, EventTypes } from './agent'
export type { Resolver } from './agent'
export { AbstractActionHandler } from './action/action-handler'
export { IdentityManager } from './identity/identity-manager'
export { AbstractIdentity } from './identity/abstract-identity'
export { AbstractIdentityController } from './identity/abstract-identity-controller'
export { AbstractIdentityProvider } from './identity/abstract-identity-provider'
export type { IdentityProviderDerived } from './identity/abstract-identity-provider'
export { AbstractKeyManagementSystem, AbstractKey } from './identity/abstract-key-management-system'
export type { SerializedKey } from './identity/abstract-key-management-system'
export { AbstractIdentityStore } from './identity/abstract-identity-store'
export type { SerializedIdentity } from './identity/abstract-identity-store'
export { AbstractKeyStore } from './identity/abstract-key-store'
export { AbstractSecretBox } from './identity/abstract-secret-box'
export { AbstractMessageHandler } from './message/abstract-message-handler'
export { ServiceManager, ServiceEventTypes } from './service/service-manager'
export type { LastMessageTimestampForInstance } from './service/service-manager'
export { AbstractServiceController } from './service/abstract-service-controller'
export { Gql } from './graphql/index'
export type { Action } from './types'
export { IdentityStore } from './identity/identity-store'
export { KeyStore } from './identity/key-store'

import { Key, KeyType } from './entities/key'
import { Identity } from './entities/identity'
import { Claim } from './entities/claim'
import { Credential } from './entities/credential'
import { Presentation } from './entities/presentation'
import { Message, MetaData } from './entities/message'

export const Entities = [Key, Identity, Message, Claim, Credential, Presentation]

export { Key, Identity, Message, Claim, Credential, Presentation }
export type { KeyType, MetaData }

export { migrations } from './migrations'
