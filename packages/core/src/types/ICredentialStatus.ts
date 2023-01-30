import { ICredentialStatusVerifier } from './ICredentialStatusVerifier.js'
import { ICredentialStatusManager } from './ICredentialStatusManager.js'

/**
 * Veramo plugin interface for plugins implementing both the {@link ICredentialStatusManager | manager} and the
 * {@link ICredentialStatusVerifier | verifier} aspects of Credential Status flow.
 *
 * @see {@link https://www.w3.org/TR/vc-data-model/#status | credentialStatus} data model
 * @see {@link @veramo/credential-status#CredentialStatusPlugin | CredentialStatusPlugin}
 *
 * @beta
 */
export type ICredentialStatus = ICredentialStatusVerifier & ICredentialStatusManager
