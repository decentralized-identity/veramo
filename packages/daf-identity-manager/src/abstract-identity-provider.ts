import { IIdentity, IKey, IService, IAgentContext, IKeyManager } from 'daf-core'

/**
 * An abstract class for the {@link daf-identity-manager#IdentityManager} identity providers
 * @public
 */
export abstract class AbstractIdentityProvider {
  abstract createIdentity(
    args: { kms?: string; alias?: string; options?: any },
    context: IAgentContext<IKeyManager>,
  ): Promise<Omit<IIdentity, 'provider'>>
  abstract deleteIdentity(args: IIdentity, context: IAgentContext<IKeyManager>): Promise<boolean>
  abstract addKey(
    args: { identity: IIdentity; key: IKey; options?: any },
    context: IAgentContext<IKeyManager>,
  ): Promise<any>
  abstract removeKey(
    args: { identity: IIdentity; kid: string; options?: any },
    context: IAgentContext<IKeyManager>,
  ): Promise<any>
  abstract addService(
    args: { identity: IIdentity; service: IService; options?: any },
    context: IAgentContext<IKeyManager>,
  ): Promise<any>
  abstract removeService(
    args: { identity: IIdentity; id: string; options?: any },
    context: IAgentContext<IKeyManager>,
  ): Promise<any>
}
