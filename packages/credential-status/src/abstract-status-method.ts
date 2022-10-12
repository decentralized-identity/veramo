import {
    CredentialStatus,
    CredentialStatusGenerateArgs,
    CredentialStatusReference,
    CredentialStatusRequestArgs,
    CredentialStatusUpdateArgs,
    IAgentContext,
    ICheckCredentialStatusArgs,
    IResolver,
    VerifiableCredential
} from "@veramo/core";

import { ICredentialIssuer } from '@veramo/credential-w3c'


/**
 * An abstract class for the {@link @veramo/credential-status#CredentialStatusRouter} status method
 */
export abstract class AbstractStatusMethod {
    abstract checkCredentialStatus(
        args: ICheckCredentialStatusArgs,
        context: IAgentContext<IResolver>
    ): Promise<CredentialStatus>

    abstract credentialStatusRead(
        args: CredentialStatusRequestArgs,
        context: IAgentContext<ICredentialIssuer>
    ): Promise<VerifiableCredential>

    abstract credentialStatusGenerate(
        args: CredentialStatusGenerateArgs
    ): Promise<CredentialStatusReference>

    abstract credentialStatusUpdate(
        args: CredentialStatusUpdateArgs
    ): Promise<any>
}