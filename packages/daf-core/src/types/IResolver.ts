import { DIDDocument } from 'did-resolver'
export { DIDDocument } from 'did-resolver'
import { IPluginMethodMap } from './IAgent'

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
}

/**
 * DID Resolver interface
 * @public
 */
export interface IResolver extends IPluginMethodMap {
  /**
   * Resolves DID and returns DID Document
   *
   * @example
   * ```typescript
   * const doc = await agent.resolveDid({
   *   didUrl: 'did:ethr:rinkeby:0xb09b66026ba5909a7cfe99b76875431d2b8d5190'
   * })
   *
   * expect(doc).toEqual({
   *   '@context': 'https://w3id.org/did/v1',
   *   id: 'did:ethr:rinkeby:0xb09b66026ba5909a7cfe99b76875431d2b8d5190',
   *   publicKey: [
   *     {
   *        id: 'did:ethr:rinkeby:0xb09b66026ba5909a7cfe99b76875431d2b8d5190#controller',
   *        type: 'Secp256k1VerificationKey2018',
   *        controller: 'did:ethr:rinkeby:0xb09b66026ba5909a7cfe99b76875431d2b8d5190',
   *        ethereumAddress: '0xb09b66026ba5909a7cfe99b76875431d2b8d5190'
   *     }
   *   ],
   *   authentication: [
   *     {
   *        type: 'Secp256k1SignatureAuthentication2018',
   *        publicKey: 'did:ethr:rinkeby:0xb09b66026ba5909a7cfe99b76875431d2b8d5190#controller'
   *     }
   *   ]
   * })
   * ```
   *
   * @param args - Input arguments for resolving a DID
   * @public
   */
  resolveDid(args: ResolveDidArgs): Promise<DIDDocument>
}
