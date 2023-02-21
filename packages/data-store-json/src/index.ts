/**
 * {@link @veramo/core#Agent} {@link @veramo/data-store-json#DataStoreJson | plugin} that implements
 * {@link @veramo/core-types#IDataStore } and
 * {@link @veramo/core-types#IDataStoreORM }interfaces and uses a JSON tree as a backend.
 *
 * The JSON tree backend can be persisted to any JSON compatible media using a callback that gets called when the agent
 * data is updated.
 *
 * @packageDocumentation
 */

export { DataStoreJson } from './data-store-json.js'
export {
  DiffCallback,
  ClaimTableEntry,
  CredentialTableEntry,
  PresentationTableEntry,
  VeramoJsonCache,
  VeramoJsonStore,
} from './types.js'
export { DIDStoreJson } from './identifier/did-store.js'
export { KeyStoreJson } from './identifier/key-store.js'
export { PrivateKeyStoreJson } from './identifier/private-key-store.js'
export { BrowserLocalStorageStore } from './browser-local-storage-store.js'
