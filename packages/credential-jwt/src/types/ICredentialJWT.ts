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
  ISpecificCredentialIssuer,
  ICreateVerifiableCredentialArgs,
  VerificationPolicies,
  W3CVerifiableCredential,
  IVerifyResult
} from '@veramo/core-types'

// interface Something = IPluginMethodMap | ISpecificCredentialIssuer

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
  verifyCredentialJWT(args: IVerifyCredentialJWTArgs, context: IRequiredContext): Promise<IVerifyResult>

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
    args: ICreateVerifiablePresentationJWTArgs,
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
  verifyPresentationJWT(args: IVerifyPresentationJWTArgs, context: IRequiredContext): Promise<IVerifyResult>

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

  // canIssueCredentialType(args: ICanIssueCredentialTypeArgs, context: IRequiredContext): boolean
  // issueCredentialType(
  //   args: ICreateVerifiableCredentialArgs,
  //   context: IRequiredContext,
  // ): Promise<VerifiableCredential>
}

/**
 * Encapsulates the parameters required to create a
 * {@link https://www.w3.org/TR/vc-data-model/#credentials | W3C Verifiable Credential}
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export interface ICreateVerifiableCredentialJWTArgs extends UsingResolutionOptions {
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
 * Encapsulates the parameters required to create a
 * {@link https://www.w3.org/TR/vc-data-model/#presentations | W3C Verifiable Presentation}
 * using the {@link https://w3c-ccg.github.io/ethereum-JWT-signature-2021-spec/ | EthereumJWTSignature2021}
 * proof format.
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export interface ICreateVerifiablePresentationJWTArgs extends UsingResolutionOptions {
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
 * Encapsulates the parameters required to verify a
 * {@link https://www.w3.org/TR/vc-data-model/#credentials | W3C Verifiable Credential}
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export interface IVerifyCredentialJWTArgs extends UsingResolutionOptions {
  /**
   * The json payload of the Credential according to the
   * {@link https://www.w3.org/TR/vc-data-model/#credentials | canonical model}
   *
   * The signer of the Credential is chosen based on the `issuer.id` property
   * of the `credential`
   *
   */
  credential: W3CVerifiableCredential


  /**
   * When dealing with JSON-LD you also MUST provide the proper contexts.
   * Set this to `true` ONLY if you want the `@context` URLs to be fetched in case they are not preloaded.
   * The context definitions SHOULD rather be provided at startup instead of being fetched.
   *
   * Defaults to `false`
   */
  fetchRemoteContexts?: boolean

  /**
   * Overrides specific aspects of credential verification, where possible.
   */
  policies?: VerificationPolicies

  /**
   * Other options can be specified for verification.
   * They will be forwarded to the lower level modules. that perform the checks
   */
  [x: string]: any
}

/**
 * Encapsulates the parameters required to verify a
 * {@link https://www.w3.org/TR/vc-data-model/#presentations | W3C Verifiable Presentation}
 *
 * @public
 */
export interface IVerifyPresentationJWTArgs extends UsingResolutionOptions {
  /**
   * The Verifiable Presentation object according to the
   * {@link https://www.w3.org/TR/vc-data-model/#presentations | canonical model} or the JWT representation.
   *
   * The signer of the Presentation is verified based on the `holder` property
   * of the `presentation` or the `iss` property of the JWT payload respectively
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
   * When dealing with JSON-LD you also MUST provide the proper contexts.
   * Set this to `true` ONLY if you want the `@context` URLs to be fetched in case they are not preloaded.
   * The context definitions SHOULD rather be provided at startup instead of being fetched.
   *
   * Defaults to `false`
   */
  fetchRemoteContexts?: boolean

  /**
   * Overrides specific aspects of credential verification, where possible.
   */
  policies?: VerificationPolicies

  /**
   * Other options can be specified for verification.
   * They will be forwarded to the lower level modules. that perform the checks
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
export type IRequiredContext = IAgentContext<IResolver & IKeyManager & IDIDManager>
