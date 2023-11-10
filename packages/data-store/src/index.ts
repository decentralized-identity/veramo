/**
 * {@link https://typeorm.io/ | TypeORM } backed plugins. {@link @veramo/core#Agent}
 * {@link @veramo/data-store#DataStore | plugin} that implements {@link @veramo/core-types#IDataStore } interface.
 * {@link @veramo/core#Agent} {@link @veramo/data-store#DataStoreORM | plugin} that implements
 * {@link @veramo/core-types#IDataStoreORM} interface. Provides {@link @veramo/data-store#KeyStore} for
 * {@link @veramo/key-manager#KeyManager} and {@link @veramo/data-store#DIDStore} for
 * {@link @veramo/did-manager#DIDManager}
 *
 * @packageDocumentation
 */

export { DIDStore } from './identifier/did-store.js'
export { KeyStore } from './identifier/key-store.js'
export { PrivateKeyStore } from './identifier/private-key-store.js'
export { DataStore } from './data-store.js'
export { DataStoreORM } from './data-store-orm.js'
export { DataStoreDiscoveryProvider } from './did-discovery-provider.js'
import { Key, KeyType } from './entities/key.js'
import { Identifier } from './entities/identifier.js'
import { Claim } from './entities/claim.js'
import { Credential } from './entities/credential.js'
import { Presentation } from './entities/presentation.js'
import { Service } from './entities/service.js'
import { Message, MetaData } from './entities/message.js'
import { PrivateKey } from './entities/private-key.js'
import { PreMigrationKey } from './entities/PreMigrationEntities.js'

/**
 * The TypeORM entities used by this package.
 *
 * This array SHOULD be used when creating a TypeORM connection.
 *
 * @public
 */
export const Entities = [
  Key,
  Identifier,
  Message,
  Claim,
  Credential,
  Presentation,
  Service,
  PrivateKey,
  PreMigrationKey,
]

/**
 * Helper function to concatenate multiple arrays of TypeORM entities.
 *
 * This array CAN be used when creating a TypeORM connection.
 *
 * @public
 */
export const entitiesConcat = (...entityArrays: unknown[][]) =>
  entityArrays.reduce((acc, entityArray) => acc.concat(entityArray), [])
export {
  KeyType,
  Key,
  Identifier,
  Message,
  Claim,
  Credential,
  Presentation,
  MetaData,
  Service,
  PrivateKey,
  PreMigrationKey,
}
export { migrations, migrationConcat } from './migrations/index.js'

// re-export the interfaces that were moved to core for backward compatibility
export { IDataStore, IDataStoreORM } from '@veramo/core-types'
