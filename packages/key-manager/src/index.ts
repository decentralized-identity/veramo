/**
 * Provides a {@link @veramo/key-manager#KeyManager | plugin} for the {@link @veramo/core#Agent}
 * that implements {@link @veramo/core-types#IKeyManager} interface
 *
 * @packageDocumentation
 */
export { KeyManager } from './key-manager.js'
export { AbstractKeyManagementSystem } from './abstract-key-management-system.js'
export { AbstractKeyStore } from './abstract-key-store.js'
export {
  AbstractPrivateKeyStore,
  ImportablePrivateKey,
  ManagedPrivateKey,
} from './abstract-private-key-store.js'
export { AbstractSecretBox } from './abstract-secret-box.js'
export { MemoryKeyStore, MemoryPrivateKeyStore } from './memory-key-store.js'
export * from './types.js'
