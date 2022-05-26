import {
  CredentialPayload,
  IAgentContext,
  IDIDManager,
  IKeyManager,
  IPluginMethodMap,
  IResolver,
  VerifiableCredential,
} from '@veramo/core'

/**
 * The interface definition for a plugin that can issue and verify Verifiable Credentials and Presentations
 * that use EIP712 proof format.
 *
 * @remarks Please see {@link https://www.w3.org/TR/vc-data-model | W3C Verifiable Credentials data model}
 *
 * @beta This API is likely to change without a BREAKING CHANGE notice
 */
export interface ICredentialIssuerEIP712 extends IPluginMethodMap {
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
  createVerifiableCredentialEIP712(
    args: ICreateVerifiableCredentialEIP712Args,
    context: IRequiredContext,
  ): Promise<VerifiableCredential>
}

/**
 * Encapsulates the parameters required to create a
 * {@link https://www.w3.org/TR/vc-data-model/#credentials | W3C Verifiable Credential}
 *
 * @beta This API is likely to change without a BREAKING CHANGE notice
 */
export interface ICreateVerifiableCredentialEIP712Args {
  /**
   * The json payload of the Credential according to the
   * {@link https://www.w3.org/TR/vc-data-model/#credentials | canonical model}
   *
   * The signer of the Credential is chosen based on the `issuer.id` property
   * of the `credential`
   *
   * `@context`, 'type' and 'issuanceDate' will be added automatically if omitted
   */
  credential: CredentialPayload

  /**
   * Specific key to use for signing
   */
  keyRef?: string
}

/**
 * Represents the requirements that this plugin has.
 * The agent that is using this plugin is expected to provide these methods.
 *
 * This interface can be used for static type checks, to make sure your application is properly initialized.
 *
 * @beta This API is likely to change without a BREAKING CHANGE notice
 */
export type IRequiredContext = IAgentContext<
  IResolver & IKeyManager & IDIDManager
>

export type ContextDoc = {
  '@context': Record<string, any>
}
