/**
 * Provides a {@link @veramo/did-comm#DIDComm | plugin} for the {@link @veramo/core#Agent} that implements
 * {@link @veramo/did-comm#IDIDComm} interface.  Provides a {@link @veramo/did-comm#DIDCommMessageHandler | plugin}
 * for the {@link @veramo/message-handler#MessageHandler} that decrypts messages.
 *
 * @packageDocumentation
 */

export {
  DIDComm,
  ISendMessageDIDCommAlpha1Args,
  IPackDIDCommMessageArgs,
  IUnpackDIDCommMessageArgs,
} from './didcomm'
export * from './types/message-types'
export * from './types/utility-types'
export * from './types/IDIDComm'
export { DIDCommMessageHandler } from './message-handler'
export * from './transports/transports'
/**
 * @beta This API may change without a BREAKING CHANGE notice.
 */
const schema = require('../plugin.schema.json')
export { schema }
