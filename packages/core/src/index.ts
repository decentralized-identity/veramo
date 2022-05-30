/**
 * Provides {@link @veramo/core#Agent} implementation and defines {@link @veramo/core#IResolver}, {@link @veramo/core#IDIDManager}, {@link @veramo/core#IKeyManager}, {@link @veramo/core#IDataStore}, {@link @veramo/core#IMessageHandler} plugin interfaces
 *
 * @packageDocumentation
 */
export { Agent, createAgent, IAgentOptions } from './agent'
export { ValidationError } from './validator'
export { CoreEvents } from './coreEvents'
export * from './types/IAgent'
export * from './types/IDataStore'
export * from './types/IDataStoreORM'
export * from './types/IIdentifier'
export * from './types/IDIDManager'
export * from './types/IKeyManager'
export * from './types/IMessage'
export * from './types/IMessageHandler'
export * from './types/IResolver'
export * from './types/vc-data-model'
const schema = require('../plugin.schema.json')
export { schema }
