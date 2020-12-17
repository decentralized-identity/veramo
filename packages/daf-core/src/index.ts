/**
 * Provides {@link daf-core#Agent} implementation and defines {@link daf-core#IResolver}, {@link daf-core#IDIDManager}, {@link daf-core#IKeyManager}, {@link daf-core#IDataStore}, {@link daf-core#IMessageHandler} plugin interfaces
 *
 * @packageDocumentation
 */
export { Agent, createAgent, IAgentOptions } from './agent'
export { ValidationError } from './validator'
export { CoreEvents } from './coreEvents'
export * from './types/IAgent'
export * from './types/IDataStore'
export * from './types/IIdentifier'
export * from './types/IDIDManager'
export * from './types/IKeyManager'
export * from './types/IMessage'
export * from './types/IMessageHandler'
export * from './types/IResolver'
const schema = require('../plugin.schema.json')
export { schema }
