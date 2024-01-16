/**
 * Provides a {@link @veramo/did-manager#DIDManager | plugin} for the
 * {@link @veramo/core#Agent} that implements {@link @veramo/core-types#IDIDManager} interface.
 *
 * @packageDocumentation
 */
export { KeyValueStore } from './key-value-store.js'
export * from './store-adapters/tiered/index.js'
export * from './store-adapters/typeorm/index.js'
export * from './key-value-types.js'
export * from './store-adapters/index.js'
