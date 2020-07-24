export { IdentityStore } from './identity/identity-store'
export { KeyStore } from './identity/key-store'
export { DataStore } from './data-store'
export {
  DataStoreORM,
  IDataStoreORM,
  FindClaimsArgs,
  FindCredentialsArgs,
  FindIdentitiesArgs,
  FindMessagesArgs,
  FindPresentationsArgs,
} from './data-store-orm'
export * from './types'
import { Key, KeyType } from './entities/key'
import { Identity } from './entities/identity'
import { Claim } from './entities/claim'
import { Credential } from './entities/credential'
import { Presentation } from './entities/presentation'
import { Service } from './entities/service'
import { Message, MetaData } from './entities/message'
export const Entities = [Key, Identity, Message, Claim, Credential, Presentation, Service]
export { KeyType, Key, Identity, Message, Claim, Credential, Presentation, MetaData, Service }
export { migrations } from './migrations'
