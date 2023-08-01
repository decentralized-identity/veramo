/**
 * Provides a {@link @veramo/credential-w3c#CredentialPlugin | plugin} for the {@link @veramo/core#Agent} that
 * implements
 * {@link @veramo/core-types#ICredentialIssuer} interface.
 *
 * Provides a {@link @veramo/credential-w3c#W3cMessageHandler | plugin} for the
 * {@link @veramo/message-handler#MessageHandler} that verifies Credentials and Presentations in a message.
 *
 * @packageDocumentation
 */
export { W3cMessageHandler, MessageTypes } from './message-handler.js'
import { CredentialPlugin } from './action-handler.js'

/**
 * @deprecated please use {@link CredentialPlugin} instead
 * @public
 */
const CredentialIssuer = CredentialPlugin
export { CredentialIssuer, CredentialPlugin }

// For backward compatibility, re-export the plugin types that were moved to core in v4
export type { ICredentialIssuer, ICredentialVerifier } from '@veramo/core-types'
