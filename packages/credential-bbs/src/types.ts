import { VerifiableCredential } from "@veramo/core"

/**
 * Describes a document with a `@context` property.
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export type ContextDoc = {
  '@context': Record<string, any>
}

export interface ICreateBbsSelectiveDisclosureCredentialArgs {
  /**
   * A document featuring a linked data proof capable of proof derivation
   */
  proofDocument: VerifiableCredential

  /**
   * A document of the form of a JSON-LD frame describing the terms to selectively derive from the proof document
   */
  revealDocument: any

  /**
   * Options for proof derivation
   */
  options: any
   /**
   * Set this to true if you want the `@context` URLs to be fetched in case they are not preloaded.
   *
   * Defaults to `false`
   */
   fetchRemoteContexts?: boolean

   /**
    * Any other options that can be forwarded to the lower level libraries
    */
   [x: string]: any
}

export interface IVerifyBbsDerivedProofCredentialArgs {
  /**
   * The json payload of the Credential according to the
   * {@link https://www.w3.org/TR/vc-data-model/#credentials | canonical model}
   *
   * The signer of the Credential is chosen based on the `issuer.id` property
   * of the `credential`
   *
   */
  credential: VerifiableCredential

  purpose: any//ControllerProofPurpose
  
  /**
   * Set this to true if you want the `@context` URLs to be fetched in case they are not preloaded.
   *
   * Defaults to `false`
   */
  fetchRemoteContexts?: boolean

  /**
   * Any other options that can be forwarded to the lower level libraries
   */
  [x: string]: any
}