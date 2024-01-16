import {
  DIDDocument,
  DIDResolutionOptions,
  DIDResolutionResult,
  KeyCapabilitySection,
  ServiceEndpoint,
  VerificationMethod,
} from 'did-resolver'
import { IPluginMethodMap } from './IAgent.js'

export { DIDDocument, DIDResolutionOptions, DIDResolutionResult } from 'did-resolver'

/**
 * Input arguments for {@link IResolver.resolveDid | resolveDid}
 * @public
 */
export interface ResolveDidArgs {
  /**
   * DID URL
   *
   * @example
   * `did:web:uport.me`
   */
  didUrl: string

  /**
   * DID resolution options that will be passed to the method specific resolver.
   * See: https://w3c.github.io/did-spec-registries/#did-resolution-input-metadata
   * See: https://www.w3.org/TR/did-core/#did-resolution-options
   */
  options?: DIDResolutionOptions
}

/**
 * Input arguments for {@link IResolver.getDIDComponentById | getDIDComponentById}
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export interface GetDIDComponentArgs {
  /**
   * the DID document from which to extract the fragment. This MUST be the document resolved by
   * {@link IResolver.resolveDid}
   */
  didDocument: DIDDocument

  /**
   * The DID URI that needs to be dereferenced.
   * This should refer to the subsection by #fragment.
   *
   * Example: did:example:identifier#controller
   */
  didUrl: string

  /**
   * Optional.
   * The section of the DID document where to search for the fragment. Example 'keyAgreement', or 'assertionMethod',
   * or 'authentication', etc
   */
  section?: DIDDocumentSection
}

/**
 * Return type of {@link IResolver.getDIDComponentById | getDIDComponentById}
 * represents a `VerificationMethod` or a `ServiceEndpoint` entry from a {@link did-resolver#DIDDocument | DIDDocument}
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export type DIDDocComponent = VerificationMethod | ServiceEndpoint

/**
 * DID Resolver interface
 * @public
 */
export interface IResolver extends IPluginMethodMap {
  /**
   * Resolves DID and returns DID Resolution Result
   *
   * @example
   * ```typescript
   * const doc = await agent.resolveDid({
   *   didUrl: 'did:ethr:0xb09b66026ba5909a7cfe99b76875431d2b8d5190'
   * })
   * expect(doc.didDocument).toEqual({
   *   '@context': expect.anything(),
   *   id: 'did:ethr:0xb09b66026ba5909a7cfe99b76875431d2b8d5190',
   *   verificationMethod: [
   *     {
   *       id: 'did:ethr:0xb09b66026ba5909a7cfe99b76875431d2b8d5190#controller',
   *       type: 'EcdsaSecp256k1RecoveryMethod2020',
   *       controller: 'did:ethr:0xb09b66026ba5909a7cfe99b76875431d2b8d5190',
   *       blockchainAccountId: 'eip155:1:0xb09B66026bA5909A7CFE99b76875431D2b8D5190',
   *     },
   *   ],
   *   authentication: ['did:ethr:0xb09b66026ba5909a7cfe99b76875431d2b8d5190#controller'],
   *   assertionMethod: ['did:ethr:0xb09b66026ba5909a7cfe99b76875431d2b8d5190#controller'],
   * })
   * ```
   *
   * @param args - Input arguments for resolving a DID
   * @public
   */
  resolveDid(args: ResolveDidArgs): Promise<DIDResolutionResult>

  /**
   * Dereferences a DID URL fragment and returns the corresponding DID document entry.
   *
   * @example
   * ```typescript
   * const did = 'did:ethr:0xb09b66026ba5909a7cfe99b76875431d2b8d5190'
   * const didFragment = `${did}#controller`
   * const fragment = await agent.getDIDComponentById({
   *   didDocument: (await agent.resolveDid({didUrl: did}))?.didDocument,
   *   didUrl: didFragment,
   *   section: 'authentication'
   * })
   * expect(fragment).toEqual({
   *   id: 'did:ethr:0xb09b66026ba5909a7cfe99b76875431d2b8d5190#controller',
   *   type: 'EcdsaSecp256k1RecoveryMethod2020',
   *   controller: 'did:ethr:0xb09b66026ba5909a7cfe99b76875431d2b8d5190',
   *   blockchainAccountId: 'eip155:1:0xb09B66026bA5909A7CFE99b76875431D2b8D5190',
   * })
   * ```
   *
   * @param args - The description of the component you want.
   *
   * @returns a `Promise` containing the {@link did-resolver#VerificationMethod | VerificationMethod} or
   *   {@link did-resolver#ServiceEndpoint | ServiceEndpoint}
   *
   * @throws `not_found:...` in case the fragment is not displayed in the DID document
   *
   * @beta This API may change without a BREAKING CHANGE notice.
   */
  getDIDComponentById(args: GetDIDComponentArgs): Promise<DIDDocComponent>
}

/**
 * Refers to a section of a DID document.
 * Either the list of verification methods or services or one of the verification relationships.
 *
 * See {@link https://www.w3.org/TR/did-core/#verification-relationships | verification relationships}
 *
 * @public
 */
export type DIDDocumentSection =
  | KeyCapabilitySection
  | 'verificationMethod'
  | 'publicKey' //used for backward compatibility
  | 'service'
