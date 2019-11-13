export { Core, EventTypes } from './core'
export { AbstractActionHandler } from './action-handler'
export { EncryptionKeyManager, KeyPair } from './encryption-manager'
export { IdentityController, IdentityManager, Issuer } from './identity-manager'
export { AbstractMessageValidator } from './message-validator'
export {
  ServiceController,
  ServiceControllerOptions,
  ServiceControllerWithConfig,
  ServiceInstanceId,
} from './service-manager'
import * as Types from './types'
import { baseTypeDefs } from './graphql-base-type-defs'
import * as GqlCore from './graphql-core'
import * as GqlIdentityManager from './graphql-identity-manager'

const Gql = {
  baseTypeDefs,
  Core: GqlCore,
  IdentityManager: GqlIdentityManager,
}

export { Types, Gql }
