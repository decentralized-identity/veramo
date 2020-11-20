/**
 * Provides a {@link daf-did-comm#DIDComm | plugin} for the {@link daf-core#Agent} that implements {@link daf-did-comm#IDIDComm} interface.  Provides a {@link daf-did-comm#DIDCommMessageHandler | plugin} for the {@link daf-message-handler#MessageHandler} that decrypts messages
 *
 * @packageDocumentation
 */
export { DIDComm, IDIDComm, ISendMessageDIDCommAlpha1Args } from './action-handler'
export { DIDCommMessageHandler } from './message-handler'
const pluginCredential = require('../plugin.credential.json')
export { pluginCredential }
