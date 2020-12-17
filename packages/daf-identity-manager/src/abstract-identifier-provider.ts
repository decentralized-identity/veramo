import { IIdentifier, IKey, IService, IAgentContext, IKeyManager } from 'daf-core'

/**
 * An abstract class for the {@link daf-identity-manager#IdManager} identifier providers
 * @public
 */
export abstract class AbstractIdentifierProvider {
  abstract createIdentifier(
    args: { kms?: string; alias?: string; options?: any },
    context: IAgentContext<IKeyManager>,
  ): Promise<Omit<IIdentifier, 'provider'>>
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
}
