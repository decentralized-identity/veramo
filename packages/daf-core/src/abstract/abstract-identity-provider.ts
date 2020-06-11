import { IIdentity, IKey, IService, IAgentBase } from '../types'
import { IAgentKeyManager } from '../key-manager'

interface IContext {
  agent: IAgentBase & IAgentKeyManager
}

export abstract class AbstractIdentityProvider {
  abstract createIdentity(
    args: { kms: string; options?: any },
    context: IContext,
  ): Promise<Omit<IIdentity, 'provider'>>
  abstract deleteIdentity(args: IIdentity, context: IContext): Promise<boolean>
  abstract addKey(args: { did: string; key: IKey; options?: any }): Promise<any>
  abstract removeKey(args: { did: string; kid: string; options?: any }): Promise<any>
  abstract addService(args: { did: string; service: IService; options?: any }): Promise<any>
  abstract removeService(args: { did: string; id: string; options?: any }): Promise<any>
}
