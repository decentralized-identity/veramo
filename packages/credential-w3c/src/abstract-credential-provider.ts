import {
  ICredentialIssuer,
  ICredentialVerifier,
  IKey,
  ProofFormat,
  W3CVerifiableCredential,
  W3CVerifiablePresentation,
} from '@veramo/core-types'

/**
 * Subset of issuer methods implemented by Credential Providers
 *
 * @internal
 */
export type IssuerMethods = Pick<
  ICredentialIssuer,
  'createVerifiableCredential' | 'createVerifiablePresentation'
>

/**
 * Subset of verifier methods implemented by Credential Providers
 *
 * @internal
 */
export type VerifierMethods = Pick<ICredentialVerifier, 'verifyCredential' | 'verifyPresentation'>

/**
 * Query a {@link ICredentialProvider} if a verification attempt can be made using the provided document
 *
 * @see {@link ICredentialProvider.canVerifyDocumentType}
 * @public
 */
export type TentativeVerificationQuery = { document: W3CVerifiableCredential | W3CVerifiablePresentation }

/**
 * Query a {@link ICredentialProvider} for a particular proof format
 *
 * @see {@link ICredentialProvider.canIssueProofFormat}
 * @public
 */
export type ProofFormatQuery = { proofFormat: ProofFormat }

/**
 * The interface definition for a sub-plugin that can issue and verify Verifiable Data
 * (e.g. Verifiable Credentials and Presentations)
 *
 * @see {@link @veramo/credential-jwt#CredentialProviderJWT} for an implementation.
 * @remarks Please see {@link https://www.w3.org/TR/vc-data-model | W3C Verifiable Credentials data model}
 *
 * @public
 */
export interface ICredentialProvider extends IssuerMethods, VerifierMethods {
  /**
   * Lists the proof formats supported by this provider for a given key
   * @param key - The key to check supported proof formats for
   *
   * @returns An array of supported proof format strings
   */
  getProofFormatsSupportedForKey(key: IKey): ProofFormat[]

  /**
   * Checks if this provider can attempt to verify a document.
   *
   * @param query - contains the document to check
   *
   * @returns a boolean indicating if a verification attempt can be made
   */
  canVerifyDocumentType(query: TentativeVerificationQuery): boolean

  /**
   * Checks if this provider can issue a credential or presentation in a particular format.
   * @param query - The proof format to check
   *
   * @returns a boolean indicating if the credential or presentation can be issued in that format
   */
  canIssueProofFormat(query: ProofFormatQuery): boolean
}
