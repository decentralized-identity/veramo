import { IIdentity, IKey, IService, IAgentBase } from '../types'
import { IAgentKeyManager } from '../key-manager'

interface IContext {
  agent: IAgentBase & IAgentKeyManager
}

export abstract class AbstractIdentityProvider {
  abstract createIdentity(
    args: { kms?: string; options?: any },
    context: IContext,
  ): Promise<Omit<IIdentity, 'provider'>>
  abstract deleteIdentity(args: IIdentity, context: IContext): Promise<boolean>
  abstract addKey(args: { identity: IIdentity; key: IKey; options?: any }, context: IContext): Promise<any>
  abstract removeKey(
    args: { identity: IIdentity; kid: string; options?: any },
    context: IContext,
  ): Promise<any>
  abstract addService(
    args: { identity: IIdentity; service: IService; options?: any },
    context: IContext,
  ): Promise<any>
  abstract removeService(
    args: { identity: IIdentity; id: string; options?: any },
    context: IContext,
  ): Promise<any>
}
