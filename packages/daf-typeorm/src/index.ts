/**
 * {@link https://typeorm.io/ | TypeORM } backed plugins. {@link @veramo/core#Agent}
 * {@link daf-typeorm#DataStore | plugin} that implements {@link @veramo/core#IDataStore } interface.
 * {@link @veramo/core#Agent} {@link daf-typeorm#DataStoreORM | plugin} that implements
 * {@link daf-typeorm#IDataStoreORM} interface. Provides {@link daf-typeorm#KeyStore} for
 * {@link @veramo/key-manager#KeyManager} and {@link daf-typeorm#DIDStore} for {@link @veramo/did-manager#DIDManager}
 *
 * @packageDocumentation
 */

export { DIDStore } from './identifier/did-store'
export { KeyStore } from './identifier/key-store'
export { DataStore } from './data-store'
export {
  DataStoreORM,
  IDataStoreORM,
  FindClaimsArgs,
  FindCredentialsArgs,
  FindIdentifiersArgs,
  FindMessagesArgs,
  FindPresentationsArgs,
  UniqueVerifiablePresentation,
  UniqueVerifiableCredential,
} from './data-store-orm'
export * from './types'
import { Key, KeyType } from './entities/key'
import { Identifier } from './entities/identifier'
import { Claim } from './entities/claim'
import { Credential } from './entities/credential'
import { Presentation } from './entities/presentation'
import { Service } from './entities/service'
import { Message, MetaData } from './entities/message'
export const Entities = [Key, Identifier, Message, Claim, Credential, Presentation, Service]
export { KeyType, Key, Identifier, Message, Claim, Credential, Presentation, MetaData, Service }
export { migrations } from './migrations'
const schema = require('../plugin.schema.json')
export { schema }
