/**
 * Provides a {@link @veramo/credential-w3c#CredentialIssuer | plugin} for the {@link @veramo/core#Agent} that
 * implements
 * {@link @veramo/credential-w3c#ICredentialIssuer} interface.
 *
 * Provides a {@link @veramo/credential-w3c#W3cMessageHandler | plugin} for the
 * {@link @veramo/message-handler#MessageHandler} that verifies Credentials and Presentations in a message.
 *
 * @packageDocumentation
 */
export { W3cMessageHandler, MessageTypes } from './message-handler'
export {
  CredentialIssuer,
  ICredentialIssuer,
  ICreateVerifiableCredentialArgs,
  ICreateVerifiablePresentationArgs,
  ProofFormat,
} from './action-handler'
/**
 * The parameter and return type schemas for the methods of the {@link @veramo/credential-w3c#ICredentialIssuer} plugin.
 *
 * @public
 */
const schema = require('../plugin.schema.json')
export { schema }
