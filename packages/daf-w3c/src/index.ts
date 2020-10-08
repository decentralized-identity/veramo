/**
 * Provides a {@link daf-w3c#CredentialIssuer | plugin} for the {@link daf-core#Agent} that implements {@link daf-w3c#ICredentialIssuer} interface. Provides a {@link daf-w3c#W3cMessageHandler | plugin} for the {@link daf-message-handler#MessageHandler} that verifies Credentials and Presentations in a message
 *
 * @packageDocumentation
 */
export { W3cMessageHandler, MessageTypes } from './message-handler'
export {
  CredentialIssuer,
  ICredentialIssuer,
  ICreateVerifiableCredentialArgs,
  ICreateVerifiablePresentationArgs,
} from './action-handler'