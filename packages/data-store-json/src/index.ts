/**
 * {@link @veramo/core#Agent} {@link @veramo/data-store-json#DataStoreJson | plugin} that implements
 * {@link @veramo/core#IDataStore } and
 * {@link @veramo/core#IDataStoreORM }interfaces and uses a JSON tree as a backend.
 *
 * The JSON tree backend can be persisted to any JSON compatible media using a callback that gets called when the agent
 * data is updated.
 *
 * @packageDocumentation
 */

export { DataStoreJson } from './data-store-json'
export {
  DiffCallback,
  ClaimTableEntry,
  CredentialTableEntry,
  PresentationTableEntry,
  VeramoJsonCache,
  VeramoJsonStore,
} from './types'
export { DIDStoreJson } from './identifier/did-store'
export { KeyStoreJson } from './identifier/key-store'
export { PrivateKeyStoreJson } from './identifier/private-key-store'
export { BrowserLocalStorageStore } from './browser-local-storage-store'
