/**
 * Provides a {@link @veramo/selective-disclosure#ISelectiveDisclosure | plugin} for the {@link @veramo/core#Agent}
 * that implements {@link @veramo/selective-disclosure#SelectiveDisclosure} interface.
 *
 * Provides a {@link @veramo/selective-disclosure#SdrMessageHandler | plugin} for the
 * {@link @veramo/message-handler#MessageHandler} that detects Selective Disclosure Request in a message
 *
 * @packageDocumentation
 */
export { SdrMessageHandler, MessageTypes } from './message-handler.js'
export { SelectiveDisclosure } from './action-handler.js'
export * from './types.js'
export { schema } from './plugin.schema.js'
