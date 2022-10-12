import { IAgentContext, IPluginMethodMap } from "./IAgent"
import { CredentialStatusGenerateArgs, CredentialStatusRequestArgs, CredentialStatusUpdateArgs } from "./ICredentialStatusManager"
import { ICheckCredentialStatusArgs } from "./ICredentialStatusVerifier"
import { IResolver } from "./IResolver"
import { CredentialStatus, CredentialStatusReference, VerifiableCredential } from "./vc-data-model"


export interface ICredentialStatusRouter extends IPluginMethodMap {
    /**
     * Returns a list of available credential status methods
    */
    statusRouterGetStatusMethods(): Promise<string[]>

    /**
     * Returns the revocation status of a credential from a given managed method
     */
    statusRouterCheckStatus(args: ICheckCredentialStatusArgs, context: IAgentContext<IResolver>): Promise<CredentialStatus>

    /**
     * Generates a `credentialStatus` property for a future credential, not yet signed.
     * 
     * @param args - Input arguments for generating a `credentialStatus` property for a {@link VerifiableCredential}
     * @returns A {@link CredentialStatusReference} object
     */
    statusRouterGenerateStatus(args: CredentialStatusGenerateArgs): Promise<CredentialStatusReference>

    /**
     * Reads a credential with a `credentialStatus` property and returns the parsed credential.
     * 
     * @param args - Input arguments to request the verifiable credential status value
     * @returns A {@link VerifiableCredential} object 
     */
    statusRouterParseStatus(args: CredentialStatusRequestArgs, context: IAgentContext<any>): Promise<VerifiableCredential>

    /**
     * Changes the status of an existing {@link VerifiableCredential}.
     * Commonly used to revoke an existing credential.
     * 
     * @param args - Input arguments for updating the status(revoking) a credential
     */
    statusRouterUpdateStatus(args: CredentialStatusUpdateArgs): Promise<any>
}