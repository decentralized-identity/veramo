import { AbstractIdentityProvider } from './abstract/abstract-identity-provider'
import { IAgentPlugin, IIdentity, IService, IKey, IPluginMethodMap, IAgentContext } from './types'
import { AbstractIdentityStore } from './abstract/abstract-identity-store'
import { IKeyManager } from './key-manager'

/**
 * Input arguments for {@link IIdentityManager.identityManagerGetIdentity | identityManagerGetIdentity}
 * @public
 */
export interface IIdentityManagerGetIdentityArgs {
  /**
   * DID
   */
  did: string
}

/**
 * Input arguments for {@link IIdentityManager.identityManagerDeleteIdentity | identityManagerDeleteIdentity}
 * @public
 */
export interface IIdentityManagerDeleteIdentityArgs {
  /**
   * DID
   */
  did: string
}

/**
 * Input arguments for {@link IIdentityManager.identityManagerCreateIdentity | identityManagerCreateIdentity}
 * @public
 */
export interface IIdentityManagerCreateIdentityArgs {
  /**
   * Optional. Identity alias. Can be used to reference an object in an external system
   */
  alias?: string

  /**
   * Optional. Identity provider
   */
  provider?: string

  /**
   * Optional. Key Management System
   */
  kms?: string

  /**
   * Optional. Identity provider specific options
   */
  options?: any
}

/**
 * Input arguments for {@link IIdentityManager.identityManagerGetOrCreateIdentity | identityManagerGetOrCreateIdentity}
 * @public
 */
export interface IIdentityManagerGetOrCreateIdentityArgs {
  /**
   * Identity alias. Can be used to reference an object in an external system
   */
  alias: string

  /**
   * Optional. Identity provider
   */
  provider?: string

  /**
   * Optional. Key Management System
   */
  kms?: string

  /**
   * Optional. Identity provider specific options
   */
  options?: any
}

/**
 * Input arguments for {@link IIdentityManager.identityManagerAddKey | identityManagerAddKey}
 * @public
 */
export interface IIdentityManagerAddKeyArgs {
  /**
   * DID
   */
  did: string

  /**
   * Key object
   */
  key: IKey

  /**
   * Optional. Identity provider specific options
   */
  options?: any
}

/**
 * Input arguments for {@link IIdentityManager.identityManagerRemoveKey | identityManagerRemoveKey}
 * @public
 */
export interface IIdentityManagerRemoveKeyArgs {
  /**
   * DID
   */
  did: string

  /**
   * Key ID
   */
  kid: string

  /**
   * Optional. Identity provider specific options
   */
  options?: any
}

/**
 * Input arguments for {@link IIdentityManager.identityManagerAddService | identityManagerAddService}
 * @public
 */
export interface IIdentityManagerAddServiceArgs {
  /**
   * DID
   */
  did: string

  /**
   * Service object
   */
  service: IService

  /**
   * Optional. Identity provider specific options
   */
  options?: any
}

/**
 * Input arguments for {@link IIdentityManager.identityManagerRemoveService | identityManagerRemoveService}
 * @public
 */
export interface IIdentityManagerRemoveServiceArgs {
  /**
   * DID
   */
  did: string

  /**
   * Service ID
   */
  id: string

  /**
   * Optional. Identity provider specific options
   */
  options?: any
}

/**
 * Identity manager interface
 * @public
 */
export interface IIdentityManager extends IPluginMethodMap {
  /**
   * Returns a list of available identity providers
   */
  identityManagerGetProviders(): Promise<Array<string>>

  /**
   * Returns a list of managed identities
   */
  identityManagerGetIdentities(): Promise<Array<IIdentity>>

  /**
   * Returns a specific identity
   */
  identityManagerGetIdentity(args: IIdentityManagerGetIdentityArgs): Promise<IIdentity>

  /**
   * Creates and returns a new identity
   *
   * @param args - Required.  Arguments to create the identity
   * @param context - {@link IAgentContext | Execution context}. Requires `agent` that has {@link IKeyManager} methods
   *
   * @example
   * ```typescript
   * const identity = await agent.identityManagerCreateIdentity({
   *   provider: 'did:ethr',
   *   kms: 'local'
   * })
   * ```
   */
  identityManagerCreateIdentity(
    args: IIdentityManagerCreateIdentityArgs,
    context: IAgentContext<IKeyManager>,
  ): Promise<IIdentity>

  /**
   * Returns an existing identity or creates a new one for a specific alias
   */
  identityManagerGetOrCreateIdentity(
    args: IIdentityManagerGetOrCreateIdentityArgs,
    context: IAgentContext<IKeyManager>,
  ): Promise<IIdentity>

  /**
   * Imports identity
   */
  identityManagerImportIdentity(args: IIdentity): Promise<IIdentity>

  /**
   * Deletes identity
   */
  identityManagerDeleteIdentity(
    args: IIdentityManagerDeleteIdentityArgs,
    context: IAgentContext<IKeyManager>,
  ): Promise<boolean>

  /**
   * Adds a key to a DID Document
   * @returns identity provider specific response. Can be txHash, etc,
   */
  identityManagerAddKey(args: IIdentityManagerAddKeyArgs, context: IAgentContext<IKeyManager>): Promise<any>

  /**
   * Removes a key from a DID Document
   * @returns identity provider specific response. Can be txHash, etc,
   */
  identityManagerRemoveKey(
    args: IIdentityManagerRemoveKeyArgs,
    context: IAgentContext<IKeyManager>,
  ): Promise<any> // txHash?

  /**
   * Adds a service to a DID Document
   * @returns identity provider specific response. Can be txHash, etc,
   */
  identityManagerAddService(
    args: IIdentityManagerAddServiceArgs,
    context: IAgentContext<IKeyManager>,
  ): Promise<any> //txHash?

  /**
   * Removes a service from a DID Document
   * @returns identity provider specific response. Can be txHash, etc,
   */
  identityManagerRemoveService(
    args: IIdentityManagerRemoveServiceArgs,
    context: IAgentContext<IKeyManager>,
  ): Promise<any> //txHash?
}

/**
 * Agent plugin that provides {@link IIdentityManager} methods
 * @public
 */
export class IdentityManager implements IAgentPlugin {
  /**
   * Plugin methods
   * @public
   */
  readonly methods: IIdentityManager

  private providers: Record<string, AbstractIdentityProvider>
  private defaultProvider: string
  private store: AbstractIdentityStore

  constructor(options: {
    providers: Record<string, AbstractIdentityProvider>
    defaultProvider: string
    store: AbstractIdentityStore
  }) {
    this.providers = options.providers
    this.defaultProvider = options.defaultProvider
    this.store = options.store
    this.methods = {
      identityManagerGetProviders: this.identityManagerGetProviders.bind(this),
      identityManagerGetIdentities: this.identityManagerGetIdentities.bind(this),
      identityManagerGetIdentity: this.identityManagerGetIdentity.bind(this),
      identityManagerCreateIdentity: this.identityManagerCreateIdentity.bind(this),
      identityManagerGetOrCreateIdentity: this.identityManagerGetOrCreateIdentity.bind(this),
      identityManagerImportIdentity: this.identityManagerImportIdentity.bind(this),
      identityManagerDeleteIdentity: this.identityManagerDeleteIdentity.bind(this),
      identityManagerAddKey: this.identityManagerAddKey.bind(this),
      identityManagerRemoveKey: this.identityManagerRemoveKey.bind(this),
      identityManagerAddService: this.identityManagerAddService.bind(this),
      identityManagerRemoveService: this.identityManagerRemoveService.bind(this),
    }
  }

  private getProvider(name: string): AbstractIdentityProvider {
    const provider = this.providers[name]
    if (!provider) throw Error('Identity provider does not exist: ' + name)
    return provider
  }

  /** {@inheritDoc IIdentityManager.identityManagerGetProviders} */
  async identityManagerGetProviders(): Promise<string[]> {
    return Object.keys(this.providers)
  }

  /** {@inheritDoc IIdentityManager.identityManagerGetIdentities} */
  async identityManagerGetIdentities(): Promise<IIdentity[]> {
    return this.store.list()
  }

  /** {@inheritDoc IIdentityManager.identityManagerGetIdentity} */
  async identityManagerGetIdentity({ did }: IIdentityManagerGetIdentityArgs): Promise<IIdentity> {
    return this.store.get({ did })
  }

  /** {@inheritDoc IIdentityManager.identityManagerCreateIdentity} */
  async identityManagerCreateIdentity(
    { provider, alias, kms, options }: IIdentityManagerCreateIdentityArgs,
    context: IAgentContext<IKeyManager>,
  ): Promise<IIdentity> {
    const providerName = provider || this.defaultProvider
    const identityProvider = this.getProvider(providerName)
    const partialIdentity = await identityProvider.createIdentity({ kms, alias, options }, context)
    const identity: IIdentity = { ...partialIdentity, alias, provider: providerName }
    await this.store.import(identity)
    return identity
  }

  /** {@inheritDoc IIdentityManager.identityManagerGetOrCreateIdentity} */
  async identityManagerGetOrCreateIdentity(
    { provider, alias, kms, options }: IIdentityManagerGetOrCreateIdentityArgs,
    context: IAgentContext<IKeyManager>,
  ): Promise<IIdentity> {
    try {
      const identity = await this.store.get({ alias })
      return identity
    } catch {
      return this.identityManagerCreateIdentity({ provider, alias, kms, options }, context)
    }
  }

  /** {@inheritDoc IIdentityManager.identityManagerImportIdentity} */
  async identityManagerImportIdentity(identity: IIdentity): Promise<IIdentity> {
    await this.store.import(identity)
    return identity
  }

  /** {@inheritDoc IIdentityManager.identityManagerDeleteIdentity} */
  async identityManagerDeleteIdentity(
    { did }: IIdentityManagerDeleteIdentityArgs,
    context: IAgentContext<IKeyManager>,
  ): Promise<boolean> {
    const identity = await this.store.get({ did })
    const provider = this.getProvider(identity.provider)
    await provider.deleteIdentity(identity, context)
    return this.store.delete({ did })
  }

  /** {@inheritDoc IIdentityManager.identityManagerAddKey} */
  async identityManagerAddKey(
    { did, key, options }: IIdentityManagerAddKeyArgs,
    context: IAgentContext<IKeyManager>,
  ): Promise<any> {
    const identity = await this.store.get({ did })
    const provider = this.getProvider(identity.provider)
    const result = await provider.addKey({ identity, key, options }, context)
    identity.keys.push(key)
    await this.store.import(identity)
    return result
  }

  /** {@inheritDoc IIdentityManager.identityManagerRemoveKey} */
  async identityManagerRemoveKey(
    { did, kid, options }: IIdentityManagerRemoveKeyArgs,
    context: IAgentContext<IKeyManager>,
  ): Promise<any> {
    const identity = await this.store.get({ did })
    const provider = this.getProvider(identity.provider)
    const result = await provider.removeKey({ identity, kid, options }, context)
    identity.keys = identity.keys.filter((k) => k.kid !== kid)
    await this.store.import(identity)
    return result
  }

  /** {@inheritDoc IIdentityManager.identityManagerAddService} */
  async identityManagerAddService(
    { did, service, options }: IIdentityManagerAddServiceArgs,
    context: IAgentContext<IKeyManager>,
  ): Promise<any> {
    const identity = await this.store.get({ did })
    const provider = this.getProvider(identity.provider)
    const result = await provider.addService({ identity, service, options }, context)
    identity.services.push(service)
    await this.store.import(identity)
    return result
  }

  /** {@inheritDoc IIdentityManager.identityManagerRemoveService} */
  async identityManagerRemoveService(
    { did, id, options }: IIdentityManagerRemoveServiceArgs,
    context: IAgentContext<IKeyManager>,
  ): Promise<any> {
    const identity = await this.store.get({ did })
    const provider = this.getProvider(identity.provider)
    const result = await provider.removeService({ identity, id, options }, context)
    identity.services = identity.services.filter((s) => s.id !== id)
    await this.store.import(identity)
    return result
  }
}
