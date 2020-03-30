import { AbstractIdentity } from './abstract-identity'
import { AbstractIdentityProvider } from './abstract-identity-provider'

interface Options {
  identityProviders: AbstractIdentityProvider[]
}

export class IdentityManager {
  private identityProviders: AbstractIdentityProvider[]

  constructor(options: Options) {
    this.identityProviders = options.identityProviders
  }

  async getIdentityProviders(): Promise<AbstractIdentityProvider[]> {
    return this.identityProviders
  }

  async getIdentityProvider(type: string): Promise<AbstractIdentityProvider> {
    for (const identityProvider of this.identityProviders) {
      if (identityProvider.type === type) {
        return identityProvider
      }
    }

    return Promise.reject('IdentityProvider not found for type: ' + type)
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
    const identities = await this.getIdentities()
    const identity = identities.find(item => item.did === did)
    if (identity) {
      return identity
    } else {
      return Promise.reject('No identity: ' + did)
    }
  }

  async createIdentity(identityProviderType: string): Promise<AbstractIdentity> {
    const identityProvider = await this.getIdentityProvider(identityProviderType)
    return identityProvider.createIdentity()
  }

  async importIdentity(identityProviderType: string, secret: string): Promise<AbstractIdentity> {
    const identityProvider = await this.getIdentityProvider(identityProviderType)
    return identityProvider.importIdentity(secret)
  }

  async exportIdentity(identityProviderType: string, did: string): Promise<string> {
    const identityProvider = await this.getIdentityProvider(identityProviderType)
    return identityProvider.exportIdentity(did)
  }

  async deleteIdentity(identityProviderType: string, did: string): Promise<boolean> {
    const identityProvider = await this.getIdentityProvider(identityProviderType)
    return identityProvider.deleteIdentity(did)
  }
}
