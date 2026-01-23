import { ICanVerifyDocumentTypeArgs, ICredentialIssuer, ICredentialVerifier, IKey } from '@veramo/core-types'

export type IssuerMethods = Pick<
  ICredentialIssuer,
  'createVerifiableCredential' | 'createVerifiablePresentation' | 'canIssueCredentialType'
>
export type VerifierMethods = Pick<ICredentialVerifier, 'verifyCredential' | 'verifyPresentation'>

/**
 * The interface definition for a sub-plugin that can issue and verify Verifiable Data
 * (e.g. Verifiable Credentials and Presentations)
 *
 * @see {@link @veramo/credential-jwt#CredentialPlugin} for an implementation.
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
  getProofFormatsSupportedForKey(key: IKey): string[]

  /**
   * Checks if this provider can verify a piece of data.
   *
   * @param args - Arguments necessary to verify a document
   * @param context  - This reserved param is automatically added and handled by the framework, *do not override*
   *
   * @returns a promise that resolves to a boolean indicating if the document can be verified
   */
  canVerifyDocumentType(args: ICanVerifyDocumentTypeArgs): boolean
}
