import {
  IAgentContext,
  IDIDManager,
  IKey,
  IKeyManager,
  IPluginMethodMap,
  IResolver,
  VerifiableCredential,
  VerifiablePresentation,
  IVerifyResult,
  IVerifyCredentialArgs,
  ICreateVerifiablePresentationArgs,
  IVerifyPresentationArgs,
  ICreateVerifiableCredentialArgs
} from '@veramo/core-types'

// interface Something = IPluginMethodMap | IProofFormatIssuer

/**
 * The interface definition for a plugin that can issue and verify Verifiable Credentials and Presentations
 * that use EIP712 proof format.
 *
 * @remarks Please see {@link https://www.w3.org/TR/vc-data-model | W3C Verifiable Credentials data model}
 * @remarks Please see
 *   {@link https://w3c-ccg.github.io/ethereum-eip712-signature-2021-spec/ | EthereumEip712Signature2021}
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export interface ICredentialIssuerEIP712 extends IPluginMethodMap {
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
  createVerifiableCredentialEIP712(
    args: ICreateVerifiableCredentialArgs,
    context: IRequiredContext,
  ): Promise<VerifiableCredential>

  /**
   * Verifies a Verifiable Credential in EIP712 Format.
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
  verifyCredentialEIP712(args: IVerifyCredentialArgs, context: IRequiredContext): Promise<IVerifyResult>

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
  createVerifiablePresentationEIP712(
    args: ICreateVerifiablePresentationArgs,
    context: IRequiredContext,
  ): Promise<VerifiablePresentation>

  /**
   * Verifies a Verifiable Presentation EIP712 Format.
   *
   * @param args - Arguments necessary to verify the Presentation
   * @param context - This reserved param is automatically added and handled by the framework, *do not override*
   *
   * @returns - a promise that resolves to the boolean true on successful verification or rejects on error
   *
   * @remarks Please see {@link https://www.w3.org/TR/vc-data-model/#presentations | Verifiable Credential data model}
   */
  verifyPresentationEIP712(args: IVerifyPresentationArgs, context: IRequiredContext): Promise<IVerifyResult>

  /**
   * Checks if a key is suitable for signing EIP712 payloads.
   * This relies on the metadata set by the key management system to determine if this key can sign EIP712 payloads.
   *
   * @param key - the key to check
   * @param context - This reserved param is automatically added and handled by the framework, *do not override*
   *
   * @internal
   */
  matchKeyForEIP712(key: IKey, context: IRequiredContext): Promise<boolean>

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
