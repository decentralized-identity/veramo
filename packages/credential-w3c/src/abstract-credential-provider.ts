import { IAgentContext, ICanIssueCredentialTypeArgs, ICanVerifyDocumentTypeArgs, ICreateVerifiableCredentialArgs, ICreateVerifiablePresentationArgs, IIdentifier, IKey, IssuerAgentContext, IVerifyCredentialArgs, IVerifyPresentationArgs, IVerifyResult, VerifiableCredential, VerifiablePresentation, VerifierAgentContext } from "@veramo/core-types";

/**
 * The interface definition for a plugin that can generate Verifiable Credentials and Presentations
 *
 * @see {@link @veramo/credential-w3c#CredentialPlugin} for an implementation.
 * @remarks Please see {@link https://www.w3.org/TR/vc-data-model | W3C Verifiable Credentials data model}
 *
 * @public
 */
export abstract class AbstractCredentialProvider {
    /**
     * Creates a Verifiable Presentation.
     * The payload, signer and format are chosen based on the `args` parameter.
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
    abstract createVerifiablePresentation(
        args: ICreateVerifiablePresentationArgs,
        context: IssuerAgentContext,
    ): Promise<VerifiablePresentation>

    /**
     * Creates a Verifiable Presentation.
     * The payload, signer and format are chosen based on the `args` parameter.
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
    abstract canIssueCredentialType(args: ICanIssueCredentialTypeArgs, context: IssuerAgentContext): Promise<boolean>


    /**
     * Matches a key against the type of proof supported by this issuer
     * 
     * @param key - The key to match against the proof type(s) supported by this issuer
     * @param context - This reserved param is automatically added and handled by the framework, *do not override*
     * 
     * @returns - a promise that resolves to a boolean indicating if the key can be used to sign a credential with this issuer
     */
    abstract matchKeyForType(key: IKey, context: IssuerAgentContext): Promise<boolean>

    /**
     * Gets the proof type supported by this issuer
     * 
     * @returns - a promise that resolves to a string of the proof format supported by this issuer
     */
    abstract getTypeProofFormat(): Promise<string>

    /**
     * Creates a Verifiable Credential.
     * The payload, signer and format are chosen based on the `args` parameter.
     *
     * @param args - Arguments necessary to create the Presentation.
     * @param context - This reserved param is automatically added and handled by the framework, *do not override*
     *
     * @returns - a promise that resolves to the {@link @veramo/core-types#VerifiableCredential} that was requested or
     *   rejects with an error if there was a problem with the input or while getting the key to sign
     *
     * @remarks Please see {@link https://www.w3.org/TR/vc-data-model/#credentials | Verifiable Credential data model}
     */
    abstract createVerifiableCredential(
        args: ICreateVerifiableCredentialArgs,
        context: IssuerAgentContext,
    ): Promise<VerifiableCredential>

    /**
     * Verifies a Verifiable Credential
     *
     * @param args - Arguments necessary to verify a VerifiableCredential
     * @param context - This reserved param is automatically added and handled by the framework, *do not override*
     *
     * @returns - a promise that resolves to an object containing a `verified` boolean property and an optional `error`
     *   for details
     *
     * @remarks Please see {@link https://www.w3.org/TR/vc-data-model/#credentials | Verifiable Credential data model}
     */
    abstract verifyCredential(args: IVerifyCredentialArgs, context: VerifierAgentContext): Promise<IVerifyResult>


    /**
     * 
     * @param args - Arguments necessary to verify a document
     * @param context  - This reserved param is automatically added and handled by the framework, *do not override*
     * 
     * @returns a promise that resolves to a boolean indicating if the document can be verified
     */
    abstract canVerifyDocumentType(args: ICanVerifyDocumentTypeArgs, context: VerifierAgentContext): Promise<boolean>

    /**
     * Verifies a Verifiable Presentation JWT or LDS Format.
     *
     * @param args - Arguments necessary to verify a VerifiableCredential
     * @param context - This reserved param is automatically added and handled by the framework, *do not override*
     *
     * @returns - a promise that resolves to an object containing a `verified` boolean property and an optional `error`
     *   for details
     *
     * @remarks Please see {@link https://www.w3.org/TR/vc-data-model/#presentations | Verifiable Credential data model}
     */
    abstract verifyPresentation(args: IVerifyPresentationArgs, context: VerifierAgentContext): Promise<IVerifyResult>

}