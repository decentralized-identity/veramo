import { AbstractIdentity } from './abstract-identity'
import { AbstractIdentityProvider } from './abstract-identity-provider'
import { TMethodMap, IAgentPlugin } from '../agent'

interface Options {
  identityProviders: AbstractIdentityProvider[]
}

export interface IAgentIdentityManager {
  getIdentityProviders?: () => Promise<AbstractIdentityProvider[]>
  getIdentities?: () => Promise<AbstractIdentity[]>
  getIdentity?: (args: { did: string }) => Promise<AbstractIdentity>
  createIdentity?: (args?: { identityProviderType?: string; options?: any }) => Promise<AbstractIdentity>
  deleteIdentity?: (args: { identityProviderType: string; did: string }) => Promise<boolean>
}

export class IdentityManager implements IAgentPlugin {
  readonly methods: TMethodMap
  private identityProviders: AbstractIdentityProvider[]

  constructor(options: Options) {
    this.identityProviders = options.identityProviders
    this.methods = {
      getIdentityProviders: this.getIdentityProviders.bind(this),
      getIdentities: this.getIdentities.bind(this),
      getIdentity: this.getIdentity.bind(this),
      createIdentity: this.createIdentity.bind(this),
      deleteIdentity: this.deleteIdentity.bind(this),
    }
  }

  getIdentityProviders(): AbstractIdentityProvider[] {
    return this.identityProviders
  }

  private getIdentityProvider(type: string): AbstractIdentityProvider {
    for (const identityProvider of this.identityProviders) {
      if (identityProvider.type === type) {
        return identityProvider
      }
    }

    throw Error('IdentityProvider not found for type: ' + type)
  }

  async getIdentities(): Promise<AbstractIdentity[]> {
    let allIdentities: AbstractIdentity[] = []
    for (const identityProvider of this.identityProviders) {
      const identities = await identityProvider.getIdentities()
      allIdentities = allIdentities.concat(identities)
    }
    return allIdentities
  }

  async getIdentity(did: string): Promise<AbstractIdentity> {
    let identity: AbstractIdentity
    for (const identityProvider of this.identityProviders) {
      const providerIdentity = await identityProvider.getIdentity(did)
      if (providerIdentity) identity = providerIdentity
    }
    if (identity) {
      return identity
    } else {
      return Promise.reject('No identity: ' + did)
    }
  }

  async createIdentity(args?: { identityProviderType?: string; options?: any }): Promise<AbstractIdentity> {
    const identityProvider = args?.identityProviderType
      ? this.getIdentityProvider(args.identityProviderType)
      : this.getDefaultIdentityProvider()
    return identityProvider.createIdentity(args?.options)
  }

  async deleteIdentity(args: { identityProviderType: string; did: string }): Promise<boolean> {
    const identityProvider = this.getIdentityProvider(args.identityProviderType)
    return identityProvider.deleteIdentity(args.did)
  }

  private getDefaultIdentityProvider(): AbstractIdentityProvider {
    return this.identityProviders[0]
  }
}
