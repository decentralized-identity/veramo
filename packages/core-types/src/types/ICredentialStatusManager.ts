export { DIDDocument, DIDResolutionOptions, DIDResolutionResult } from 'did-resolver'
import { IPluginMethodMap } from './IAgent.js'
import { CredentialStatusReference, VerifiableCredential } from './vc-data-model.js'

/**
 * The arguments expected by a plugin that implements a credential status type/method
 * in order to change the status of an issued verifiable credential.
 *
 * Each credential status type has its own specific parameters according to their spec.
 *
 * @see {@link https://w3c-ccg.github.io/vc-status-list-2021/ | StatusList2021Entry }
 * @see {@link https://w3c-ccg.github.io/vc-csl2017/ | CredentialStatusList2017 }
 * @see {@link https://www.w3.org/TR/vc-data-model/#status | credential status data model }
 *
 * @beta
 */
interface CredentialStatusUpdateOptions {
  [x: string]: any
}

/**
 * Input arguments for {@link ICredentialStatusManager.credentialStatusUpdate  | credentialStatusUpdate}
 * @beta
 */
export interface CredentialStatusUpdateArgs {
  /**
   * The verifiable credential whose status will be updated.
   */
  vc: VerifiableCredential

  /**
   * Options that will be forwarded to the credentialStatus method specific manager.
   *
   * @see {@link https://www.w3.org/TR/vc-data-model/#status}
   */
  options?: CredentialStatusUpdateOptions
}

/**
 * Arguments for generating a `credentialStatus` property for a {@link VerifiableCredential}.
 * @see {@link ICredentialStatusManager.credentialStatusGenerate | credentialStatusGenerate}
 *
 * @beta
 */
export interface CredentialStatusGenerateArgs {
  /**
   * The credential status type (aka credential status method) to be used in the `credentialStatus` generation.
   */
  type: string

  /**
   * Any other options will be forwarded to the credentialStatus method driver
   */
  [x: string]: any
}

/**
 * Credential status manager interface
 * @beta
 */
export interface ICredentialStatusManager extends IPluginMethodMap {
  /**
   * Changes the status of an existing {@link VerifiableCredential}.
   * Commonly used to revoke an existing credential.
   *
   * @param args - Input arguments for updating the status(revoking) a credential
   * @beta
   */
  credentialStatusUpdate(args: CredentialStatusUpdateArgs): Promise<any>

  /**
   * Generates a `credentialStatus` property for a future credential, not yet signed.
   *
   * This method is used during the creation of a {@link VerifiableCredential} in order to make it capable of
   * having its status updated later (to be revoked).
   *
   * @param args - Input arguments for generating the `credentialStatus` field of a new credential
   * @beta
   */
  credentialStatusGenerate(args: CredentialStatusGenerateArgs): Promise<CredentialStatusReference>

  /**
   * List all the credential status types (methods) available in the current agent instance.
   */
  credentialStatusTypes(): Promise<Array<string>>
}
