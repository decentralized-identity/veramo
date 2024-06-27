import { IAgentPlugin } from './IAgent.js'
import { ICredentialIssuer, ICredentialIssuerHandler } from './ICredentialIssuer.js'
import { ICredentialVerifier, ICredentialVerifierHandler } from './ICredentialVerifier.js'

/**
 * The interface definition for a plugin that can generate and verify Verifiable Credentials and Presentations
 *
 * @remarks Please see {@link https://www.w3.org/TR/vc-data-model | W3C Verifiable Credentials data model}
 *
 * @public
 */
export type ICredentialPlugin = ICredentialIssuer & ICredentialVerifier

export type ICredentialHandler = ICredentialIssuerHandler & ICredentialVerifierHandler

/**
 * The interface definition for the arguments required to initialize a {@link ICredentialPlugin}
 *
 * @public
 */
export type ICredentialPluginArgs = {
    issuers: ICredentialHandler[]
}