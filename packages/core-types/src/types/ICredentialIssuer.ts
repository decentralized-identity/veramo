import { IAgentContext, IPluginMethodMap } from './IAgent.js'
import {
  CredentialPayload,
  PresentationPayload,
  VerifiableCredential,
  VerifiablePresentation,
} from './vc-data-model.js'
import { IResolver } from './IResolver.js'
import { IDIDManager } from './IDIDManager.js'
import { IDataStore } from './IDataStore.js'
import { IKeyManager } from './IKeyManager.js'
import { IIdentifier, IKey } from "./IIdentifier.js";
import { UsingResolutionOptions } from './ICredentialVerifier.js'

/**
 * Encapsulates the parameters required to create a
 * {@link https://www.w3.org/TR/vc-data-model/#presentations | W3C Verifiable Presentation}
 *
 * @public
 */
export interface ICreateVerifiablePresentationArgs extends UsingResolutionOptions {
  /**
   * The JSON payload of the Presentation according to the
   * {@link https://www.w3.org/TR/vc-data-model/#presentations | canonical model}.
   *
   * The signer of the Presentation is chosen based on the `holder` property
   * of the `presentation`
   *
   * `@context`, `type` and `issuanceDate` will be added automatically if omitted
   */
  presentation: PresentationPayload

  /**
   * If this parameter is true, the resulting VerifiablePresentation is sent to the
   * {@link @veramo/core-types#IDataStore | storage plugin} to be saved.
   * <p/><p/>
   * @deprecated Please call
   *   {@link @veramo/core-types#IDataStore.dataStoreSaveVerifiablePresentation |
   *   dataStoreSaveVerifiablePresentation()} to save the credential after creating it.
   */
  save?: boolean

  /**
   * Optional (only JWT) string challenge parameter to add to the verifiable presentation.
   */
  challenge?: string

  /**
   * Optional string domain parameter to add to the verifiable presentation.
   */
  domain?: string

  /**
   * The desired format for the VerifiablePresentation to be created.
   */
  proofFormat: string

  /**
   * Remove payload members during JWT-JSON transformation. Defaults to `true`.
   * See https://www.w3.org/TR/vc-data-model/#jwt-encoding
   */
  removeOriginalFields?: boolean

  /**
   * [Optional] The ID of the key that should sign this presentation.
   * If this is not specified, the first matching key will be used.
   */
  keyRef?: string

  /**
   * When dealing with JSON-LD you also MUST provide the proper contexts.
   * Set this to `true` ONLY if you want the `@context` URLs to be fetched in case they are not preloaded.
   * The context definitions SHOULD rather be provided at startup instead of being fetched.
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
 * @public
 */
export interface ICreateVerifiableCredentialArgs extends UsingResolutionOptions {
  /**
   * The JSON payload of the Credential according to the
   * {@link https://www.w3.org/TR/vc-data-model/#credentials | canonical model}
   *
   * The signer of the Credential is chosen based on the `issuer.id` property
   * of the `credential`
   *
   * `@context`, `type` and `issuanceDate` will be added automatically if omitted
   */
  credential: CredentialPayload

  /**
   * If this parameter is true, the resulting VerifiableCredential is sent to the
   * {@link @veramo/core-types#IDataStore | storage plugin} to be saved.
   *
   * @deprecated Please call
   *   {@link @veramo/core-types#IDataStore.dataStoreSaveVerifiableCredential | dataStoreSaveVerifiableCredential()} to
   *   save the credential after creating it.
   */
  save?: boolean

  /**
   * The desired format for the VerifiableCredential to be created.
   */
  proofFormat: string

  /**
   * Remove payload members during JWT-JSON transformation. Defaults to `true`.
   * See https://www.w3.org/TR/vc-data-model/#jwt-encoding
   */
  removeOriginalFields?: boolean

  /**
   * [Optional] The ID of the key that should sign this credential.
   * If this is not specified, the first matching key will be used.
   */
  keyRef?: string

  /**
   * When dealing with JSON-LD you also MUST provide the proper contexts.
   * Set this to `true` ONLY if you want the `@context` URLs to be fetched in case they are not preloaded.
   * The context definitions SHOULD rather be provided at startup instead of being fetched.
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
 * Encapsulates the response object to verifyPresentation method after verifying a
 * {@link https://www.w3.org/TR/vc-data-model/#presentations | W3C Verifiable Presentation}
 *
 * @public
 */

/**
 * Encapsulates the parameters required to check if a credential type can be issued
 * 
 * @public
 */
export interface ICanIssueCredentialTypeArgs {
  proofFormat: string
}

/**
 * The interface definition for a plugin that can generate Verifiable Credentials and Presentations
 *
 * @see {@link @veramo/credential-w3c#CredentialPlugin} for an implementation.
 * @remarks Please see {@link https://www.w3.org/TR/vc-data-model | W3C Verifiable Credentials data model}
 *
 * @public
 */
export interface ICredentialIssuer extends IPluginMethodMap {
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
   */
  createVerifiablePresentation(
    args: ICreateVerifiablePresentationArgs,
    context: IssuerAgentContext,
  ): Promise<VerifiablePresentation>

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
  */
  canIssueCredentialType(args: ICanIssueCredentialTypeArgs, context: IssuerAgentContext): Promise<boolean>


  /**
   * Matches a key against the type of proof supported by this issuer
   * 
   * @param key - The key to match against the proof type(s) supported by this issuer
   * @param context - This reserved param is automatically added and handled by the framework, *do not override*
   * 
   * @returns - a promise that resolves to a boolean indicating if the key can be used to sign a credential with this issuer
   */
  matchKeyForType(key: IKey, context: IssuerAgentContext): Promise<boolean>

  /**
   * Gets the proof type supported by this issuer
   * 
   * @returns - a promise that resolves to a string of the proof format supported by this issuer
   */
  getTypeProofFormat(): Promise<string>

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
   */
  createVerifiableCredential(
    args: ICreateVerifiableCredentialArgs,
    context: IssuerAgentContext,
  ): Promise<VerifiableCredential>

  /**
   * Returns a list of supported proof formats.
   * @param identifier - The identifier that may be used to sign a credential or presentation
   * @param context - This reserved param is automatically added and handled by the framework, *do not override*
   *
   * @beta This API may change without a BREAKING CHANGE notice.
   */
  listUsableProofFormats(identifier: IIdentifier, context: IAgentContext<{}>): Promise<Array<string>>

}


/**
 * The interface definition for a plugin that can generate Verifiable Credentials and Presentations
 *
 * @see {@link @veramo/credential-w3c#CredentialPlugin} for an implementation.
 * @remarks Please see {@link https://www.w3.org/TR/vc-data-model | W3C Verifiable Credentials data model}
 *
 * @public
 */
export interface ICredentialIssuerHandler {
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
   */
  createVerifiablePresentation(
    args: ICreateVerifiablePresentationArgs,
    context: IssuerAgentContext,
  ): Promise<VerifiablePresentation>

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
  */
  canIssueCredentialType(args: ICanIssueCredentialTypeArgs, context: IssuerAgentContext): Promise<boolean>


  /**
   * Matches a key against the type of proof supported by this issuer
   * 
   * @param key - The key to match against the proof type(s) supported by this issuer
   * @param context - This reserved param is automatically added and handled by the framework, *do not override*
   * 
   * @returns - a promise that resolves to a boolean indicating if the key can be used to sign a credential with this issuer
   */
  matchKeyForType(key: IKey, context: IssuerAgentContext): Promise<boolean>

  /**
   * Gets the proof type supported by this issuer
   * 
   * @returns - a promise that resolves to a string of the proof format supported by this issuer
   */
  getTypeProofFormat(): Promise<string>

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
   */
  createVerifiableCredential(
    args: ICreateVerifiableCredentialArgs,
    context: IssuerAgentContext,
  ): Promise<VerifiableCredential>

  /**
   * Returns a list of supported proof formats.
   * @param identifier - The identifier that may be used to sign a credential or presentation
   * @param context - This reserved param is automatically added and handled by the framework, *do not override*
   *
   * @beta This API may change without a BREAKING CHANGE notice.
   */
  listUsableProofFormats(identifier: IIdentifier, context: IAgentContext<{}>): Promise<Array<string>>

}

/**
 * Represents the requirements that this plugin has.
 * The agent that is using this plugin is expected to provide these methods.
 *
 * This interface can be used for static type checks, to make sure your application is properly initialized.
 *
 * @beta
 */
export type IssuerAgentContext = IAgentContext<
  IResolver &
  Pick<IDIDManager, 'didManagerGet' | 'didManagerFind'> &
  Pick<IDataStore, 'dataStoreSaveVerifiablePresentation' | 'dataStoreSaveVerifiableCredential'> &
  Pick<IKeyManager, 'keyManagerGet' | 'keyManagerSign'>
>
