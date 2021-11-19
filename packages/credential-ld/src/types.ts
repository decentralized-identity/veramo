import {
  IAgentContext,
  IDIDManager,
  IKey,
  IKeyManager,
  IPluginMethodMap,
  IResolver,
  VerifiableCredential,
  VerifiablePresentation,
} from '@veramo/core'

/**
 * The interface definition for a plugin that can issue and verify Verifiable Credentials and Presentations
 * that use JSON-LD format.
 *
 * @remarks Please see {@link https://www.w3.org/TR/vc-data-model | W3C Verifiable Credentials data model}
 *
 * @beta This API is likely to change without a BREAKING CHANGE notice
 */
export interface ICredentialIssuerLD extends IPluginMethodMap {
  /**
   * Creates a Verifiable Presentation.
   * The payload, signer and format are chosen based on the `args` parameter.
   *
   * @param args - Arguments necessary to create the Presentation.
   * @param context - This reserved param is automatically added and handled by the framework, *do not override*
   *
   * @returns - a promise that resolves to the {@link @veramo/core#VerifiablePresentation} that was requested or rejects with an error
   * if there was a problem with the input or while getting the key to sign
   *
   * @remarks Please see {@link https://www.w3.org/TR/vc-data-model/#presentations | Verifiable Presentation data model }
   *
   * @beta This API is likely to change without a BREAKING CHANGE notice
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
   * @returns - a promise that resolves to the {@link @veramo/core#VerifiableCredential} that was requested or rejects with an error
   * if there was a problem with the input or while getting the key to sign
   *
   * @remarks Please see {@link https://www.w3.org/TR/vc-data-model/#credentials | Verifiable Credential data model}
   *
   * @beta This API is likely to change without a BREAKING CHANGE notice
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
   * @beta This API is likely to change without a BREAKING CHANGE notice
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
   * @beta This API is likely to change without a BREAKING CHANGE notice
   */
  verifyPresentationLD(args: IVerifyPresentationLDArgs, context: IRequiredContext): Promise<boolean>
}

/**
 * Encapsulates the parameters required to create a
 * {@link https://www.w3.org/TR/vc-data-model/#presentations | W3C Verifiable Presentation}
 *
 * @beta This API is likely to change without a BREAKING CHANGE notice
 */
export interface ICreateVerifiablePresentationLDArgs {
  /**
   * The json payload of the Presentation according to the
   * {@link https://www.w3.org/TR/vc-data-model/#presentations | canonical model}.
   *
   * The signer of the Presentation is chosen based on the `holder` property
   * of the `presentation`
   *
   * '@context', 'type' and 'issuanceDate' will be added automatically if omitted
   */
  presentation: Partial<PresentationPayload>

  /**
   * Optional (only JWT) string challenge parameter to add to the verifiable presentation.
   */
  challenge?: string

  /**
   * Optional string domain parameter to add to the verifiable presentation.
   */
  domain?: string

  /**
   * Optional. The key handle ({@link IKey#kid}) from the internal database.
   */
  keyRef?: string
}

/**
 * Encapsulates the parameters required to create a
 * {@link https://www.w3.org/TR/vc-data-model/#credentials | W3C Verifiable Credential}
 *
 * @beta This API is likely to change without a BREAKING CHANGE notice
 */
export interface ICreateVerifiableCredentialLDArgs {
  /**
   * The json payload of the Credential according to the
   * {@link https://www.w3.org/TR/vc-data-model/#credentials | canonical model}
   *
   * The signer of the Credential is chosen based on the `issuer.id` property
   * of the `credential`
   *
   * '@context', 'type' and 'issuanceDate' will be added automatically if omitted
   */
  credential: Partial<CredentialPayload>

  /**
   * Optional. The key handle ({@link IKey#kid}) from the internal database.
   */
  keyRef?: string
}

/**
 * Encapsulates the parameters required to verify a
 * {@link https://www.w3.org/TR/vc-data-model/#credentials | W3C Verifiable Credential}
 *
 * @beta This API is likely to change without a BREAKING CHANGE notice
 */
export interface IVerifyCredentialLDArgs {
  /**
   * The json payload of the Credential according to the
   * {@link https://www.w3.org/TR/vc-data-model/#credentials | canonical model}
   *
   * The signer of the Credential is chosen based on the `issuer.id` property
   * of the `credential`
   *
   */
  credential: VerifiableCredential
}

/**
 * Encapsulates the parameters required to verify a
 * {@link https://www.w3.org/TR/vc-data-model/#presentations | W3C Verifiable Presentation}
 *
 * @beta This API is likely to change without a BREAKING CHANGE notice
 */
export interface IVerifyPresentationLDArgs {
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
}

/**
 * Represents the requirements that this plugin has.
 * The agent that is using this plugin is expected to provide these methods.
 *
 * This interface can be used for static type checks, to make sure your application is properly initialized.
 *
 * @beta This API is likely to change without a BREAKING CHANGE notice
 */
export type IRequiredContext = IAgentContext<IResolver &
  Pick<IDIDManager, 'didManagerGet'> &
  Pick<IKeyManager, 'keyManagerGet' | 'keyManagerSign'>>

export type JWT = string

export type IssuerType = { id: string, [x: string]: any } | string
export type CredentialSubject = { id?: string, [x: string]: any }

export interface CredentialStatus {
  id: string
  type: string

  [x: string]: any
}

export type DateType = string | Date

/**
 * used as input when creating Verifiable Credentials
 */
export interface CredentialPayload {
  '@context': string | string[]
  id?: string
  type: string | string[]
  issuer: IssuerType
  issuanceDate: DateType
  expirationDate?: DateType
  credentialSubject: CredentialSubject
  credentialStatus?: CredentialStatus

  [x: string]: any
}

/**
 * used as input when creating Verifiable Presentations
 */
export interface PresentationPayload {
  '@context': string | string[]
  type: string | string[]
  id?: string
  verifiableCredential?: (VerifiableCredential | JWT)[]
  holder: string
  verifier?: string | string[]
  issuanceDate?: string
  expirationDate?: string,

  [x: string]: any
}

export type ContextDoc = {
  "@context": Record<string, any>
}

export const MANDATORY_CREDENTIAL_CONTEXT = 'https://www.w3.org/2018/credentials/v1'