import { ICredentialIssuer } from './ICredentialIssuer.js'
import { ICredentialVerifier } from './ICredentialVerifier.js'

/**
 * The interface definition for a plugin that can generate and verify Verifiable Credentials and Presentations
 *
 * @remarks Please see {@link https://www.w3.org/TR/vc-data-model | W3C Verifiable Credentials data model}
 *
 * @public
 */
export type ICredentialPlugin = ICredentialIssuer & ICredentialVerifier
