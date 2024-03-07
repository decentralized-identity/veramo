/**
 * Provides a {@link @veramo/did-comm#DIDComm | plugin} for the {@link @veramo/core#Agent} that implements
 * {@link @veramo/did-comm#IDIDComm} interface.  Provides a {@link @veramo/did-comm#DIDCommMessageHandler | plugin}
 * for the {@link @veramo/message-handler#MessageHandler} that decrypts messages.
 *
 * @packageDocumentation
 */

export * from './didcomm.js'
export * from './types/message-types.js'
export * from './types/utility-types.js'
export * from './types/IDIDComm.js'
export { DIDCommMessageHandler } from './message-handler.js'
export * from './protocols/index.js'
export * from './transports/transports.js'
export { schema } from './plugin.schema.js'
