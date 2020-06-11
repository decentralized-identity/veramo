import { IIdentity, IKey, IService, IAgentBase } from '../types'
import { IAgentKeyManager } from '../key-manager'

interface IContext {
  agent: IAgentBase & IAgentKeyManager
}

export abstract class AbstractIdentityProvider {
  abstract createIdentity(
    args: { kms: string; alias?: string; options?: any },
    context: IContext,
  ): Promise<IIdentity>
  abstract deleteIdentity(args: { did: string }, context: IContext): Promise<boolean>
  abstract addKey: (args: { did: string; key: IKey; options?: any }) => Promise<any>
  abstract removeKey: (args: { did: string; kid: string; options?: any }) => Promise<any>
  abstract addService: (args: { did: string; service: IService; options?: any }) => Promise<any>
  abstract removeService: (args: { did: string; id: string; options?: any }) => Promise<any>
}
