import {
  IAgentContext,
  ICreateVerifiableCredentialArgs,
  ICreateVerifiablePresentationArgs,
  IDIDManager,
  IKey,
  IKeyManager,
  IPluginMethodMap,
  IResolver,
  IVerifyCredentialArgs,
  IVerifyPresentationArgs,
  IVerifyResult,
  VerifiableCredential,
  VerifiablePresentation,
} from '@veramo/core-types'

/**
 * The interface definition for a plugin that can issue and verify Verifiable Credentials and Presentations
 * that use JSON-LD format (also called Data Integrity Proofs).
 *
 * @remarks Please see {@link https://www.w3.org/TR/vc-data-model | W3C Verifiable Credentials data model}
 * @see {@link https://www.w3.org/TR/vc-data-model/#data-integrity-proofs | Data Integrity proofs}
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export interface ICredentialIssuerLD extends IPluginMethodMap {
  /**
   * Creates a Verifiable Presentation.
   * The payload, signer and format are chosen based on the `args` parameter.
   *
   * @param args - Arguments necessary to create the Presentation.
   * @param context - This reserved param is automatically added and handled by the framework, *do not override*
   *
   * @returns - a promise that resolves to the {@link @veramo/core-types#VerifiablePresentation} that was requested or
   *   rejects with an error if there was a problem with the input or while getting the key to sign
   *
   * @remarks Please see {@link https://www.w3.org/TR/vc-data-model/#presentations | Verifiable Presentation data model
   *   }
   *
   * @beta This API may change without a BREAKING CHANGE notice.
   */
  createVerifiablePresentationLD(
    args: ICreateVerifiablePresentationArgs,
    context: IRequiredContext,
  ): Promise<VerifiablePresentation>

  /**
   * Creates a Verifiable Credential.
   * The payload, signer and format are chosen based on the `args` parameter.
   *
   * @param args - Arguments necessary to create the Presentation.
   * @param context - This reserved param is automatically added and handled by the framework, *do not override*
   *
   * @returns - a promise that resolves to the {@link @veramo/core-types#VerifiableCredential} that was requested or
   *   rejects with an error if there was a problem with the input or while getting the key to sign
   *
   * @remarks Please see {@link https://www.w3.org/TR/vc-data-model/#credentials | Verifiable Credential data model}
   *
   * @beta This API may change without a BREAKING CHANGE notice.
   */
  createVerifiableCredentialLD(
    args: ICreateVerifiableCredentialArgs,
    context: IRequiredContext,
  ): Promise<VerifiableCredential>

  /**
   * Verifies a Verifiable Credential JWT or LDS Format.
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
  verifyCredentialLD(args: IVerifyCredentialArgs, context: IRequiredContext): Promise<IVerifyResult>

  /**
   * Verifies a Verifiable Presentation JWT or LDS Format.
   *
   * @param args - Arguments necessary to verify a VerifiableCredential
   * @param context - This reserved param is automatically added and handled by the framework, *do not override*
   *
   * @returns - a promise that resolves to the boolean true on successful verification or rejects on error
   *
   * @remarks Please see {@link https://www.w3.org/TR/vc-data-model/#presentations | Verifiable Credential data model}
   *
   * @beta This API may change without a BREAKING CHANGE notice.
   */
  verifyPresentationLD(args: IVerifyPresentationArgs, context: IRequiredContext): Promise<IVerifyResult>

  /**
   * Returns true if the key is supported by any of the installed LD Signature suites
   * @param key - the key to verify
   * @param context - This reserved param is automatically added and handled by the framework, *do not override*
   *
   * @internal
   */
  matchKeyForLDSuite(key: IKey, context: IAgentContext<{}>): Promise<boolean>
}

/**
 * Represents the requirements that this plugin has.
 * The agent that is using this plugin is expected to provide these methods.
 *
 * This interface can be used for static type checks, to make sure your application is properly initialized.
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export type IRequiredContext = IAgentContext<
  IResolver & Pick<IDIDManager, 'didManagerGet'> & Pick<IKeyManager, 'keyManagerGet' | 'keyManagerSign'>
>

/**
 * Describes a document with a `@context` property.
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export type ContextDoc = {
  '@context': Record<string, any>
}
