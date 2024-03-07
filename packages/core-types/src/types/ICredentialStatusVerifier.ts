import { DIDDocument } from 'did-resolver'
import { IAgentContext, IPluginMethodMap } from './IAgent.js'
import { VerifiableCredential, CredentialStatus } from './vc-data-model.js'
import { IResolver } from './IResolver.js'
import { UsingResolutionOptions } from './ICredentialVerifier.js'

/**
 * Arguments for calling {@link ICredentialStatusVerifier.checkCredentialStatus | checkCredentialStatus}.
 *
 * The credential whose status should be checked and the DID document of the credential issuer.
 *
 * See {@link https://www.w3.org/TR/vc-data-model/#status | Credential Status}
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export interface ICheckCredentialStatusArgs extends UsingResolutionOptions {
  /**
   * The credential whose status needs to be checked
   */
  credential: VerifiableCredential

  /**
   * The DID document of the issuer. This can be used in case the DID Document is already resolver, to avoid a
   * potentially expensive DID resolution operation.
   */
  didDocumentOverride?: DIDDocument
}

/**
 * This interface defines a plugin that can check the {@link https://www.w3.org/TR/vc-data-model/#status | status} of a
 * {@link @veramo/core-types#VerifiableCredential | Verifiable Credential}.
 *
 * This is used for the discovery of information about the current status of a verifiable credential, such as whether
 * it is suspended or revoked. The precise contents of the credential status information is determined by the specific
 * `credentialStatus` type definition, and varies depending on factors such as whether it is simple to implement or if
 * it is privacy-enhancing.
 *
 * The result provided by implementations of this plugin depend on whether the implementation of the StatusMethod is
 * available.
 *
 * @see {@link https://www.w3.org/TR/vc-data-model/#status | Credential Status} for data model documentation.
 * @see {@link @veramo/credential-status#CredentialStatusPlugin | CredentialStatusPlugin } for an implementation.
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export interface ICredentialStatusVerifier extends IPluginMethodMap {
  /**
   * Checks the status of a {@link @veramo/core-types#VerifiableCredential | Verifiable Credential}.
   *
   * @param args - The credential to be checked, along with the DID document of the issuer.
   * @param context - *RESERVED* This is filled by the framework when the method is called.
   */
  checkCredentialStatus(
    args: ICheckCredentialStatusArgs,
    context: IAgentContext<IResolver>,
  ): Promise<CredentialStatus>
}
