/**
 * Provides a {@link @veramo/message-threads#IMessageThreads | plugin} for the {@link @veramo/core#Agent}
 *
 * @packageDocumentation
 */
export { MessageThreads } from './action-handler'
export { DIDCommChatMessageHandler, MessageTypes } from './message-handler'

export * from './types'
const schema = require('../plugin.schema.json')
export { schema }
