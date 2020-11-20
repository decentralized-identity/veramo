import { AbstractIdentityProvider } from './abstract-identity-provider'
import {
  IAgentPlugin,
  IIdentity,
  IAgentContext,
  IIdentityManager,
  IKeyManager,
  IIdentityManagerGetIdentityArgs,
  IIdentityManagerCreateIdentityArgs,
  IIdentityManagerGetIdentityByAliasArgs,
  IIdentityManagerGetOrCreateIdentityArgs,
  IIdentityManagerDeleteIdentityArgs,
  IIdentityManagerAddKeyArgs,
  IIdentityManagerRemoveKeyArgs,
  IIdentityManagerAddServiceArgs,
  IIdentityManagerRemoveServiceArgs,
  IIdentityManagerGetIdentitiesArgs,
  IIdentityManagerSetAliasArgs,
  pluginCredential,
} from 'daf-core'
import { AbstractIdentityStore } from './abstract-identity-store'

/**
 * Agent plugin that implements {@link daf-core#IIdentityManager} interface
 * @public
 */
export class IdentityManager implements IAgentPlugin {
  /**
   * Plugin methods
   * @public
   */
  readonly methods: IIdentityManager
  readonly schema = pluginCredential.credentialSubject.interfaces.IIdentityManager

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
      identityManagerGetIdentityByAlias: this.identityManagerGetIdentityByAlias.bind(this),
      identityManagerCreateIdentity: this.identityManagerCreateIdentity.bind(this),
      identityManagerSetAlias: this.identityManagerSetAlias.bind(this),
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

  /** {@inheritDoc daf-core#IIdentityManager.identityManagerGetProviders} */
  async identityManagerGetProviders(): Promise<string[]> {
    return Object.keys(this.providers)
  }

  /** {@inheritDoc daf-core#IIdentityManager.identityManagerGetIdentities} */
  async identityManagerGetIdentities(args: IIdentityManagerGetIdentitiesArgs): Promise<IIdentity[]> {
    return this.store.list(args)
  }

  /** {@inheritDoc daf-core#IIdentityManager.identityManagerGetIdentity} */
  async identityManagerGetIdentity({ did }: IIdentityManagerGetIdentityArgs): Promise<IIdentity> {
    return this.store.get({ did })
  }

  /** {@inheritDoc daf-core#IIdentityManager.identityManagerGetIdentityByAlias} */
  async identityManagerGetIdentityByAlias({
    alias,
    provider,
  }: IIdentityManagerGetIdentityByAliasArgs): Promise<IIdentity> {
    const providerName = provider || this.defaultProvider
    return this.store.get({ alias, provider: providerName })
  }

  /** {@inheritDoc daf-core#IIdentityManager.identityManagerCreateIdentity} */
  async identityManagerCreateIdentity(
    args: IIdentityManagerCreateIdentityArgs,
    context: IAgentContext<IKeyManager>,
  ): Promise<IIdentity> {
    const providerName = args?.provider || this.defaultProvider
    if (args?.alias !== undefined) {
      let existingIdentity
      try {
        existingIdentity = await this.store.get({ alias: args.alias, provider: providerName })
      } catch (e) {}
      if (existingIdentity) {
        throw Error(`Identity with alias: ${args.alias}, provider: ${providerName} already exists`)
      }
    }
    const identityProvider = this.getProvider(providerName)
    const partialIdentity = await identityProvider.createIdentity(
      { kms: args?.kms, alias: args?.alias, options: args?.options },
      context,
    )
    const identity: IIdentity = { ...partialIdentity, provider: providerName }
    if (args?.alias) {
      identity.alias = args.alias
    }
    await this.store.import(identity)
    return identity
  }

  /** {@inheritDoc daf-core#IIdentityManager.identityManagerGetOrCreateIdentity} */
  async identityManagerGetOrCreateIdentity(
    { provider, alias, kms, options }: IIdentityManagerGetOrCreateIdentityArgs,
    context: IAgentContext<IKeyManager>,
  ): Promise<IIdentity> {
    try {
      const providerName = provider || this.defaultProvider
      const identity = await this.store.get({ alias, provider: providerName })
      return identity
    } catch {
      return this.identityManagerCreateIdentity({ provider, alias, kms, options }, context)
    }
  }

  /** {@inheritDoc daf-core#IIdentityManager.identityManagerSetAlias} */
  async identityManagerSetAlias(
    { did, alias }: IIdentityManagerSetAliasArgs,
    context: IAgentContext<IKeyManager>,
  ): Promise<boolean> {
    const identity = await this.store.get({ did })
    identity.alias = alias
    return await this.store.import(identity)
  }
  /** {@inheritDoc daf-core#IIdentityManager.identityManagerImportIdentity} */
  async identityManagerImportIdentity(
    identity: IIdentity,
    context: IAgentContext<IKeyManager>,
  ): Promise<IIdentity> {
    for (const key of identity.keys) {
      await context.agent.keyManagerImportKey(key)
    }
    await this.store.import(identity)
    return identity
  }

  /** {@inheritDoc daf-core#IIdentityManager.identityManagerDeleteIdentity} */
  async identityManagerDeleteIdentity(
    { did }: IIdentityManagerDeleteIdentityArgs,
    context: IAgentContext<IKeyManager>,
  ): Promise<boolean> {
    const identity = await this.store.get({ did })
    const provider = this.getProvider(identity.provider)
    await provider.deleteIdentity(identity, context)
    if (identity.services.length > 0) {
      identity.services = []
      await this.store.import(identity)
    }
    return this.store.delete({ did })
  }

  /** {@inheritDoc daf-core#IIdentityManager.identityManagerAddKey} */
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

  /** {@inheritDoc daf-core#IIdentityManager.identityManagerRemoveKey} */
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

  /** {@inheritDoc daf-core#IIdentityManager.identityManagerAddService} */
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

  /** {@inheritDoc daf-core#IIdentityManager.identityManagerRemoveService} */
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
