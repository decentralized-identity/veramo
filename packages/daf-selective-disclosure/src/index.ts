/**
 * Provides a {@link daf-selective-disclosure#ISelectiveDisclosure | plugin} for the {@link @veramo/core#Agent}
 * that implements {@link daf-selective-disclosure#SelectiveDisclosure} interface.
 *
 * Provides a {@link daf-selective-disclosure#SdrMessageHandler | plugin} for the
 * {@link @veramo/message-handler#MessageHandler} that detects Selective Disclosure Request in a message
 *
 * @packageDocumentation
 */
export { SdrMessageHandler, MessageTypes } from './message-handler'
export { SelectiveDisclosure } from './action-handler'
export * from './types'
const schema = require('../plugin.schema.json')
export { schema }
