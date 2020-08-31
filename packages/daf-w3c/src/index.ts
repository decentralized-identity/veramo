/**
 * Defines and implements {@link daf-w3c#ICredentialIssuer} plugin interface. Provides a {@link daf-w3c#W3cMessageHandler | plugin} for `daf-message-handler`
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
