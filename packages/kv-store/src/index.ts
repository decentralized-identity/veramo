/**
 * Provides a {@link @veramo/did-manager#DIDManager | plugin} for the
 * {@link @veramo/core#Agent} that implements {@link @veramo/core-types#IDIDManager} interface.
 *
 * @packageDocumentation
 */
export { KeyValueStore } from './key-value-store'
export * from './store-adapters/tiered/index'
export * from './store-adapters/typeorm/index'
export * from './key-value-types'
export * from './store-adapters/index'
