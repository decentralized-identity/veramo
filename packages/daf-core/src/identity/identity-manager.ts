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

  getIdentityProviders(): AbstractIdentityProvider[] {
    return this.identityProviders
  }

  getIdentityProvider(type: string): AbstractIdentityProvider {
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

  async createIdentity(identityProviderType?: string, options?: any): Promise<AbstractIdentity> {
    const identityProvider = identityProviderType
      ? this.getIdentityProvider(identityProviderType)
      : this.getDefaultIdentityProvider()
    return identityProvider.createIdentity(options)
  }

  async importIdentity(identityProviderType: string, secret: string): Promise<AbstractIdentity> {
    const identityProvider = this.getIdentityProvider(identityProviderType)
    return identityProvider.importIdentity(secret)
  }

  async exportIdentity(identityProviderType: string, did: string): Promise<string> {
    const identityProvider = this.getIdentityProvider(identityProviderType)
    return identityProvider.exportIdentity(did)
  }

  async deleteIdentity(identityProviderType: string, did: string): Promise<boolean> {
    const identityProvider = this.getIdentityProvider(identityProviderType)
    return identityProvider.deleteIdentity(did)
  }

  private getDefaultIdentityProvider(): AbstractIdentityProvider {
    return this.identityProviders[0]
  }
}
