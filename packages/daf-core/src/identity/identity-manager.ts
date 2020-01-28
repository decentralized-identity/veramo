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

  async getIdentityProviderTypes(): Promise<{ type: string; description: string }[]> {
    return this.identityProviders.map(provider => ({
      type: provider.type,
      description: provider.description,
    }))
  }

  async createIdentity(identityProviderType: string): Promise<AbstractIdentity> {
    for (const identityProvider of this.identityProviders) {
      if (identityProvider.type === identityProviderType) {
        return identityProvider.createIdentity()
      }
    }

    return Promise.reject('IdentityProvider not found for type: ' + identityProviderType)
  }

  async importIdentity(identityProviderType: string, secret: string): Promise<AbstractIdentity> {
    for (const identityProvider of this.identityProviders) {
      if (identityProvider.type === identityProviderType) {
        return identityProvider.importIdentity(secret)
      }
    }

    return Promise.reject('IdentityProvider not found for type: ' + identityProviderType)
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

  async exportIdentity(did: string): Promise<string> {
    const identity = await this.getIdentity(did)
    for (const identityProvider of this.identityProviders) {
      if (identityProvider.type === identity.identityProviderType) {
        return identityProvider.exportIdentity(identity.did)
      }
    }
    return Promise.reject()
  }

  async deleteIdentity(did: string): Promise<boolean> {
    const identity = await this.getIdentity(did)
    for (const identityProvider of this.identityProviders) {
      if (identityProvider.type === identity.identityProviderType) {
        return identityProvider.deleteIdentity(identity.did)
      }
    }
    return Promise.reject()
  }
}
