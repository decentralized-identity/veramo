/**
 * Provides a {@link @veramo/key-manager#KeyManager | plugin} for the {@link @veramo/core#Agent}
 * that implements {@link @veramo/core#IKeyManager} interface
 *
 * @packageDocumentation
 */
export { KeyManager } from './key-manager'
export { AbstractKeyManagementSystem } from './abstract-key-management-system'
export { AbstractKeyStore } from './abstract-key-store'
export { AbstractPrivateKeyStore, ImportablePrivateKey, ManagedPrivateKey } from './abstract-private-key-store'
export { AbstractSecretBox } from './abstract-secret-box'
export { MemoryKeyStore, MemoryPrivateKeyStore } from './memory-key-store'
export * from './types'