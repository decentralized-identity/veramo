/**
 * {@link @veramo/data-store-json#DataStoreJson | plugin} that implements {@link @veramo/core#IDataStore } interface
 * and uses a JSON tree as the data store.
 * {@link @veramo/core#Agent} {@link @veramo/data-store-json#DataStoreORMJson | plugin} that implements
 * {@link @veramo/data-store#IDataStoreORM} interface using a JSON tree as a backend.
 *
 * @packageDocumentation
 */

export { DataStoreJson } from './data-store-json'
export { VeramoJsonCache } from './types'
export { DIDStoreJson } from './identifier/did-store'
export { KeyStoreJson } from './identifier/key-store'
export { PrivateKeyStoreJson } from './identifier/private-key-store'
