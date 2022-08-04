import { VerifiableCredential } from 'did-jwt-vc'
import {
  CredentialStatus as CredentialStatusVerification
} from 'credential-status'

export { DIDDocument, DIDResolutionOptions, DIDResolutionResult } from 'did-resolver'
import { IPluginMethodMap } from './IAgent'
import { CredentialStatus, CredentialStatusType } from './vc-data-model'

/**
 * The arguments expected by a plugin that implements a credential status type/method 
 * in order to change the status of an issued verifiable credential.
 * 
 * Each cretential status type has its own specific parameters according to their spec.
 * 
 * @see https://w3c-ccg.github.io/vc-status-list-2021/ | StatusList2021Entry
 * @see https://w3c-ccg.github.io/vc-csl2017/ | CredentialStatusList2017
 *
 * @beta
 */
interface CredentialStatusUpdateOptions { [x: string]: any }

/**
 * Input arguments for {@link ICredentialStatus.credentialStatusUpdate  | credentialStatusUpdate}
 * @beta
 */
export interface CredentialStatusUpdateArgs {
  /**
   * The verifiable credential whose status will be updated.
   */
  vc: VerifiableCredential

  /**
   * Credential status strategy options that will be passed to the method specific manager.
   * 
   * @see: https://www.w3.org/TR/vc-data-model/#status
   */
  options?: CredentialStatusUpdateOptions
}

/**
 * Arguments for generating a `credentialStatus` property for a {@link VerifiableCredential}.
 * @see {@link ICredentialStatus.credentialStatusGenerate}
 *
 * @beta
 */
export interface CredentialStatusGenerateArgs {
  /**
   * The credential status type (aka credential status method) to be used in the `cretentialStatus` generation.
   */
  type: CredentialStatusType
}

/**
 * Credential status manager interface
 * @public
 */
export interface ICredentialStatus extends IPluginMethodMap {
  /**
   * Changes the status of an existing verifiable credential. 
   * Commonly used to revoke an existent credential.
   * 
   * @param args - Input arguments for updating the status or revoking a credential
   * @public
   */
  credentialStatusUpdate(args: CredentialStatusUpdateArgs): Promise<CredentialStatusVerification>

  /**
   * Generates a `credentialStatus` property for a future credential, not yet signed.
   * 
   * This method is used during the creation of a VC in order to make the VC capable of 
   * having its status updated later, allowing it to be revoked later by instance.
   * 
   * @param args - Input arguments for generating the `credentialStatus` field of a new credential
   * @public
   */
  credentialStatusGenerate(args: CredentialStatusGenerateArgs): Promise<CredentialStatus>

  /**
   * List all the credential status types (methods) available in the current agent instance.
   */
  credentialStatusTypes(): Promise<CredentialStatusType[]>

  /**
   * Returns the status verification of a particular credential.
   */
  credentialStatusRead(vc: VerifiableCredential): Promise<CredentialStatusVerification>
}