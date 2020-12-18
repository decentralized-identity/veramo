/**
 * Provides a {@link @veramo/did-comm#DIDComm | plugin} for the {@link @veramo/core#Agent} that implements
 * {@link @veramo/did-comm#IDIDComm} interface.  Provides a {@link @veramo/did-comm#DIDCommMessageHandler | plugin}
 * for the {@link @veramo/message-handler#MessageHandler} that decrypts messages.
 *
 * @packageDocumentation
 */
export { DIDComm, IDIDComm, ISendMessageDIDCommAlpha1Args } from './action-handler'
export { DIDCommMessageHandler } from './message-handler'
const schema = require('../plugin.schema.json')
export { schema }
