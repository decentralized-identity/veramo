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
    args: ICreateVerifiablePresentationLDArgs,
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
    args: ICreateVerifiableCredentialLDArgs,
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
  verifyCredentialLD(args: IVerifyCredentialLDArgs, context: IRequiredContext): Promise<boolean>

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
  verifyPresentationLD(args: IVerifyPresentationLDArgs, context: IRequiredContext): Promise<boolean>

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
 * Encapsulates the parameters required to create a
 * {@link https://www.w3.org/TR/vc-data-model/#presentations | W3C Verifiable Presentation}
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export interface ICreateVerifiablePresentationLDArgs extends UsingResolutionOptions {
  /**
   * The json payload of the Presentation according to the
   * {@link https://www.w3.org/TR/vc-data-model/#presentations | canonical model}.
   *
   * The signer of the Presentation is chosen based on the `holder` property
   * of the `presentation`
   *
   * `@context`, `type` and `issuanceDate` will be added automatically if omitted.
   */
  presentation: PresentationPayload

  /**
   * Optional (only JWT) string challenge parameter to add to the verifiable presentation.
   */
  challenge?: string

  /**
   * Optional string domain parameter to add to the verifiable presentation.
   */
  domain?: string

  /**
   * Optional. The key handle ({@link @veramo/core-types#IKey.kid | IKey.kid}) from the internal database.
   */
  keyRef?: string

  /**
   * Set this to true if you want the `@context` URLs to be fetched in case they are not preloaded.
   *
   * Defaults to `false`
   */
  fetchRemoteContexts?: boolean

  /**
   * Any other options that can be forwarded to the lower level libraries
   */
  [x: string]: any
}

/**
 * Encapsulates the parameters required to create a
 * {@link https://www.w3.org/TR/vc-data-model/#credentials | W3C Verifiable Credential}
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export interface ICreateVerifiableCredentialLDArgs extends UsingResolutionOptions {
  /**
   * The json payload of the Credential according to the
   * {@link https://www.w3.org/TR/vc-data-model/#credentials | canonical model}
   *
   * The signer of the Credential is chosen based on the `issuer.id` property
   * of the `credential`
   *
   * `@context`, `type` and `issuanceDate` will be added automatically if omitted
   */
  credential: CredentialPayload

  /**
   * Optional. The key handle ({@link @veramo/core-types#IKey.kid | IKey.kid}) from the internal database.
   */
  keyRef?: string

  /**
   * Set this to true if you want the `@context` URLs to be fetched in case they are not preloaded.
   *
   * Defaults to `false`
   */
  fetchRemoteContexts?: boolean

  /**
   * Any other options that can be forwarded to the lower level libraries
   */
  [x: string]: any
}

/**
 * Encapsulates the parameters required to verify a
 * {@link https://www.w3.org/TR/vc-data-model/#credentials | W3C Verifiable Credential}
 *
 * @beta This API may change without a BREAKING CHANGE notice
 */
export interface IVerifyCredentialLDArgs extends UsingResolutionOptions {
  /**
   * The json payload of the Credential according to the
   * {@link https://www.w3.org/TR/vc-data-model/#credentials | canonical model}
   *
   * The signer of the Credential is chosen based on the `issuer.id` property
   * of the `credential`
   *
   */
  credential: VerifiableCredential

  /**
   * Set this to true if you want the `@context` URLs to be fetched in case they are not preloaded.
   *
   * Defaults to `false`
   */
  fetchRemoteContexts?: boolean

  /**
   * Any other options that can be forwarded to the lower level libraries
   */
  [x: string]: any
}

/**
 * Encapsulates the parameters required to verify a
 * {@link https://www.w3.org/TR/vc-data-model/#presentations | W3C Verifiable Presentation}
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export interface IVerifyPresentationLDArgs extends UsingResolutionOptions {
  /**
   * The json payload of the Credential according to the
   * {@link https://www.w3.org/TR/vc-data-model/#credentials | canonical model}
   *
   * The signer of the Credential is chosen based on the `issuer.id` property
   * of the `credential`
   *
   */
  presentation: VerifiablePresentation

  /**
   * Optional (only for JWT) string challenge parameter to verify the verifiable presentation against
   */
  challenge?: string

  /**
   * Optional (only for JWT) string domain parameter to verify the verifiable presentation against
   */
  domain?: string

  /**
   * Set this to true if you want the `@context` URLs to be fetched in case they are not preloaded.
   *
   * Defaults to `false`
   */
  fetchRemoteContexts?: boolean

  /**
   * Any other options that can be forwarded to the lower level libraries
   */
  [x: string]: any
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
