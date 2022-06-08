/**
 * Provides a {@link @veramo/did-discovery#IDIDDiscovery | plugin} for the {@link @veramo/core#Agent}
 *
 * @packageDocumentation
 */
export { DIDDiscovery } from './action-handler'
export { AbstractDidDiscoveryProvider } from './abstract-did-discovery-provider'
export * from './types'

/**
 * The parameter and return type schemas for the methods of the {@link @veramo/did-discovery#DIDDiscovery} plugin.
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
const schema = require('../plugin.schema.json')
export { schema }
