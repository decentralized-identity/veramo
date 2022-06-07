/**
 * Provides a {@link @veramo/selective-disclosure#ISelectiveDisclosure | plugin} for the {@link @veramo/core#Agent}
 * that implements {@link @veramo/selective-disclosure#SelectiveDisclosure} interface.
 *
 * Provides a {@link @veramo/selective-disclosure#SdrMessageHandler | plugin} for the
 * {@link @veramo/message-handler#MessageHandler} that detects Selective Disclosure Request in a message
 *
 * @packageDocumentation
 */
export { SdrMessageHandler, MessageTypes } from './message-handler'
export { SelectiveDisclosure } from './action-handler'
export * from './types'

/**
 * The parameter and return types schemas for the {@link @veramo/selective-disclosure#SelectiveDisclosure} plugin
 * methods.
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
const schema = require('../plugin.schema.json')
export { schema }
