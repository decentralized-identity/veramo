import { IIdentifier, IKey, IService, IAgentContext, IKeyManager, DIDDocument } from '@veramo/core-types'

/**
 * An abstract class for the {@link @veramo/did-manager#DIDManager} identifier providers
 * @public
 */
export abstract class AbstractIdentifierProvider {
  abstract createIdentifier(
    args: { kms?: string; alias?: string; options?: any },
    context: IAgentContext<IKeyManager>,
  ): Promise<Omit<IIdentifier, 'provider'>>

  abstract updateIdentifier?(
    args: { did: string, document: Partial<DIDDocument>, options?: { [x: string]: any } },
    context: IAgentContext<IKeyManager>,
  ): Promise<IIdentifier>

  abstract deleteIdentifier(args: IIdentifier, context: IAgentContext<IKeyManager>): Promise<boolean>

  abstract addKey(
    args: { identifier: IIdentifier; key: IKey; options?: any },
    context: IAgentContext<IKeyManager>,
  ): Promise<any>

  abstract removeKey(
    args: { identifier: IIdentifier; kid: string; options?: any },
    context: IAgentContext<IKeyManager>,
  ): Promise<any>

  abstract addService(
    args: { identifier: IIdentifier; service: IService; options?: any },
    context: IAgentContext<IKeyManager>,
  ): Promise<any>

  abstract removeService(
    args: { identifier: IIdentifier; id: string; options?: any },
    context: IAgentContext<IKeyManager>,
  ): Promise<any>

  /**
   * Subclasses can override this to signal that they can work with a given DID prefix
   * @param prefix - a DID URL prefix, Example: 'did:key:z6Mk', or `did:ethr`, or `did:ethr:arbitrum:testnet`
   */
  matchPrefix?(prefix: string): boolean {
    return false
  }
}
