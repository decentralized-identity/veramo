export { Core, EventTypes, Resolver } from './core'
export { AbstractActionHandler } from './action/action-handler'
export { EncryptionKeyManager, KeyPair } from './encryption-manager'
export { IdentityController, IdentityManager, Issuer } from './identity/identity-manager'
export { AbstractMessageValidator } from './message/message-validator'
export { Message } from './message/message'
export {
  ServiceController,
  ServiceControllerOptions,
  ServiceControllerWithConfig,
  ServiceInstanceId,
} from './service-manager'
import * as Types from './types'
import { baseTypeDefs } from './graphql/graphql-base-type-defs'
import * as GqlCore from './graphql/graphql-core'
import * as GqlIdentityManager from './graphql/graphql-identity-manager'

const Gql = {
  baseTypeDefs,
  Core: GqlCore,
  IdentityManager: GqlIdentityManager,
}

export { Types, Gql }
