import {
  CredentialPayload,
  IAgentContext,
  IDIDManager,
  IKey,
  IKeyManager,
  IPluginMethodMap,
  IResolver,
  PresentationPayload,
  UsingResolutionOptions,
  VerifiableCredential,
  VerifiablePresentation,
  ICreateVerifiableCredentialArgs,
  VerificationPolicies,
  W3CVerifiableCredential,
  IVerifyResult,
  ICreateVerifiablePresentationArgs,
  IVerifyCredentialArgs,
  IVerifyPresentationArgs
} from '@veramo/core-types'

/**
 * The interface definition for a plugin that can issue and verify Verifiable Credentials and Presentations
 * that use JWT proof format.
 *
 * @remarks Please see {@link https://www.w3.org/TR/vc-data-model | W3C Verifiable Credentials data model}
 * @remarks Please see
 *   {@link fix| FIX}
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export interface ICredentialIssuerJWT extends IPluginMethodMap {
  /**
   * Creates a Verifiable Credential.
   * The payload, signer and format are chosen based on the `args` parameter.
   *
   * @param args - Arguments necessary to create the Credential.
   * @param context - This reserved param is automatically added and handled by the framework, *do not override*
   *
   * @returns - a promise that resolves to the {@link @veramo/core-types#VerifiableCredential} that was requested or
   *   rejects with an error if there was a problem with the input or while getting the key to sign
   *
   * @remarks Please see {@link https://www.w3.org/TR/vc-data-model/#credentials | Verifiable Credential data model}
   *
   * @beta This API may change without a BREAKING CHANGE notice.
   */
  createVerifiableCredentialJWT(
    args: ICreateVerifiableCredentialArgs,
    context: IRequiredContext,
  ): Promise<VerifiableCredential>

  /**
   * Verifies a Verifiable Credential in JWT Format.
   *
   * @param args - Arguments necessary to verify a VerifiableCredential
   * @param context - This reserved param is automatically added and handled by the framework, *do not override*
   *
   * @returns - a promise that resolves to the boolean true on successful verification or rejects on error
   *
   * @remarks Please see {@link https://www.w3.org/TR/vc-data-model/#credentials | Verifiable Credential data model}
   *
   * @beta This API may change without a BREAKING CHANGE notice.
   */
  verifyCredentialJWT(args: IVerifyCredentialArgs, context: IRequiredContext): Promise<IVerifyResult>

  /**
   * Creates a Verifiable Presentation.
   * The payload and signer are chosen based on the `args` parameter.
   *
   * @param args - Arguments necessary to create the Presentation.
   * @param context - This reserved param is automatically added and handled by the framework, *do not override*
   *
   * @returns - a promise that resolves to the {@link @veramo/core-types#VerifiablePresentation} that was requested or
   *   rejects with an error if there was a problem with the input or while getting the key to sign
   *
   * @remarks Please see {@link https://www.w3.org/TR/vc-data-model/#presentations | Verifiable Presentation data model
   *   }
   */
  createVerifiablePresentationJWT(
    args: ICreateVerifiablePresentationArgs,
    context: IRequiredContext,
  ): Promise<VerifiablePresentation>

  /**
   * Verifies a Verifiable Presentation JWT Format.
   *
   * @param args - Arguments necessary to verify the Presentation
   * @param context - This reserved param is automatically added and handled by the framework, *do not override*
   *
   * @returns - a promise that resolves to the boolean true on successful verification or rejects on error
   *
   * @remarks Please see {@link https://www.w3.org/TR/vc-data-model/#presentations | Verifiable Credential data model}
   */
  verifyPresentationJWT(args: IVerifyPresentationArgs, context: IRequiredContext): Promise<IVerifyResult>

  /**
   * Checks if a key is suitable for signing JWT payloads.
   * This relies on the metadata set by the key management system to determine if this key can sign JWT payloads.
   *
   * @param key - the key to check
   * @param context - This reserved param is automatically added and handled by the framework, *do not override*
   *
   * @internal
   */
  matchKeyForJWT(key: IKey, context: IRequiredContext): Promise<boolean>

}

/**
 * Represents the requirements that this plugin has.
 * The agent that is using this plugin is expected to provide these methods.
 *
 * This interface can be used for static type checks, to make sure your application is properly initialized.
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export type IRequiredContext = IAgentContext<IResolver & IKeyManager & IDIDManager>
