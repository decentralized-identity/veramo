import { AbstractIdentifierProvider } from './abstract-identifier-provider'
import {
  IAgentPlugin,
  IIdentifier,
  IAgentContext,
  IIdManager,
  IKeyManager,
  IIdManagerGetIdentifierArgs,
  IIdManagerCreateIdentifierArgs,
  IIdManagerGetIdentifierByAliasArgs,
  IIdManagerGetOrCreateIdentifierArgs,
  IIdManagerDeleteIdentifierArgs,
  IIdManagerAddKeyArgs,
  IIdManagerRemoveKeyArgs,
  IIdManagerAddServiceArgs,
  IIdManagerRemoveServiceArgs,
  IIdManagerGetIdentifiersArgs,
  IIdManagerSetAliasArgs,
  schema,
} from 'daf-core'
import { AbstractIdentifierStore } from './abstract-identifier-store'

/**
 * Agent plugin that implements {@link daf-core#IIdManager} interface
 * @public
 */
export class IdManager implements IAgentPlugin {
  /**
   * Plugin methods
   * @public
   */
  readonly methods: IIdManager
  readonly schema = schema.IIdManager

  private providers: Record<string, AbstractIdentifierProvider>
  private defaultProvider: string
  private store: AbstractIdentifierStore

  constructor(options: {
    providers: Record<string, AbstractIdentifierProvider>
    defaultProvider: string
    store: AbstractIdentifierStore
  }) {
    this.providers = options.providers
    this.defaultProvider = options.defaultProvider
    this.store = options.store
    this.methods = {
      idManagerGetProviders: this.idManagerGetProviders.bind(this),
      idManagerGetIdentifiers: this.idManagerGetIdentifiers.bind(this),
      idManagerGetIdentifier: this.idManagerGetIdentifier.bind(this),
      idManagerGetIdentifierByAlias: this.idManagerGetIdentifierByAlias.bind(this),
      idManagerCreateIdentifier: this.idManagerCreateIdentifier.bind(this),
      idManagerSetAlias: this.idManagerSetAlias.bind(this),
      idManagerGetOrCreateIdentifier: this.idManagerGetOrCreateIdentifier.bind(this),
      idManagerImportIdentifier: this.idManagerImportIdentifier.bind(this),
      idManagerDeleteIdentifier: this.idManagerDeleteIdentifier.bind(this),
      idManagerAddKey: this.idManagerAddKey.bind(this),
      idManagerRemoveKey: this.idManagerRemoveKey.bind(this),
      idManagerAddService: this.idManagerAddService.bind(this),
      idManagerRemoveService: this.idManagerRemoveService.bind(this),
    }
  }

  private getProvider(name: string): AbstractIdentifierProvider {
    const provider = this.providers[name]
    if (!provider) throw Error('Identifier provider does not exist: ' + name)
    return provider
  }

  /** {@inheritDoc daf-core#IIdManager.idManagerGetProviders} */
  async idManagerGetProviders(): Promise<string[]> {
    return Object.keys(this.providers)
  }

  /** {@inheritDoc daf-core#IIdManager.idManagerGetIdentifiers} */
  async idManagerGetIdentifiers(args: IIdManagerGetIdentifiersArgs): Promise<IIdentifier[]> {
    return this.store.list(args)
  }

  /** {@inheritDoc daf-core#IIdManager.idManagerGetIdentifier} */
  async idManagerGetIdentifier({ did }: IIdManagerGetIdentifierArgs): Promise<IIdentifier> {
    return this.store.get({ did })
  }

  /** {@inheritDoc daf-core#IIdManager.idManagerGetIdentifierByAlias} */
  async idManagerGetIdentifierByAlias({
    alias,
    provider,
  }: IIdManagerGetIdentifierByAliasArgs): Promise<IIdentifier> {
    const providerName = provider || this.defaultProvider
    return this.store.get({ alias, provider: providerName })
  }

  /** {@inheritDoc daf-core#IIdManager.idManagerCreateIdentifier} */
  async idManagerCreateIdentifier(
    args: IIdManagerCreateIdentifierArgs,
    context: IAgentContext<IKeyManager>,
  ): Promise<IIdentifier> {
    const providerName = args?.provider || this.defaultProvider
    if (args?.alias !== undefined) {
      let existingIdentifier
      try {
        existingIdentifier = await this.store.get({ alias: args.alias, provider: providerName })
      } catch (e) {}
      if (existingIdentifier) {
        throw Error(`Identifier with alias: ${args.alias}, provider: ${providerName} already exists`)
      }
    }
    const identifierProvider = this.getProvider(providerName)
    const partialIdentifier = await identifierProvider.createIdentifier(
      { kms: args?.kms, alias: args?.alias, options: args?.options },
      context,
    )
    const identifier: IIdentifier = { ...partialIdentifier, provider: providerName }
    if (args?.alias) {
      identifier.alias = args.alias
    }
    await this.store.import(identifier)
    return identifier
  }

  /** {@inheritDoc daf-core#IIdManager.idManagerGetOrCreateIdentifier} */
  async idManagerGetOrCreateIdentifier(
    { provider, alias, kms, options }: IIdManagerGetOrCreateIdentifierArgs,
    context: IAgentContext<IKeyManager>,
  ): Promise<IIdentifier> {
    try {
      const providerName = provider || this.defaultProvider
      const identifier = await this.store.get({ alias, provider: providerName })
      return identifier
    } catch {
      return this.idManagerCreateIdentifier({ provider, alias, kms, options }, context)
    }
  }

  /** {@inheritDoc daf-core#IIdManager.idManagerSetAlias} */
  async idManagerSetAlias(
    { did, alias }: IIdManagerSetAliasArgs,
    context: IAgentContext<IKeyManager>,
  ): Promise<boolean> {
    const identifier = await this.store.get({ did })
    identifier.alias = alias
    return await this.store.import(identifier)
  }
  /** {@inheritDoc daf-core#IIdManager.idManagerImportIdentifier} */
  async idManagerImportIdentifier(
    identifier: IIdentifier,
    context: IAgentContext<IKeyManager>,
  ): Promise<IIdentifier> {
    for (const key of identifier.keys) {
      await context.agent.keyManagerImportKey(key)
    }
    await this.store.import(identifier)
    return identifier
  }

  /** {@inheritDoc daf-core#IIdManager.idManagerDeleteIdentifier} */
  async idManagerDeleteIdentifier(
    { did }: IIdManagerDeleteIdentifierArgs,
    context: IAgentContext<IKeyManager>,
  ): Promise<boolean> {
    const identifier = await this.store.get({ did })
    const provider = this.getProvider(identifier.provider)
    await provider.deleteIdentifier(identifier, context)
    if (identifier.services.length > 0) {
      identifier.services = []
      await this.store.import(identifier)
    }
    return this.store.delete({ did })
  }

  /** {@inheritDoc daf-core#IIdManager.idManagerAddKey} */
  async idManagerAddKey(
    { did, key, options }: IIdManagerAddKeyArgs,
    context: IAgentContext<IKeyManager>,
  ): Promise<any> {
    const identifier = await this.store.get({ did })
    const provider = this.getProvider(identifier.provider)
    const result = await provider.addKey({ identifier, key, options }, context)
    identifier.keys.push(key)
    await this.store.import(identifier)
    return result
  }

  /** {@inheritDoc daf-core#IIdManager.idManagerRemoveKey} */
  async idManagerRemoveKey(
    { did, kid, options }: IIdManagerRemoveKeyArgs,
    context: IAgentContext<IKeyManager>,
  ): Promise<any> {
    const identifier = await this.store.get({ did })
    const provider = this.getProvider(identifier.provider)
    const result = await provider.removeKey({ identifier, kid, options }, context)
    identifier.keys = identifier.keys.filter((k) => k.kid !== kid)
    await this.store.import(identifier)
    return result
  }

  /** {@inheritDoc daf-core#IIdManager.idManagerAddService} */
  async idManagerAddService(
    { did, service, options }: IIdManagerAddServiceArgs,
    context: IAgentContext<IKeyManager>,
  ): Promise<any> {
    const identifier = await this.store.get({ did })
    const provider = this.getProvider(identifier.provider)
    const result = await provider.addService({ identifier, service, options }, context)
    identifier.services.push(service)
    await this.store.import(identifier)
    return result
  }

  /** {@inheritDoc daf-core#IIdManager.idManagerRemoveService} */
  async idManagerRemoveService(
    { did, id, options }: IIdManagerRemoveServiceArgs,
    context: IAgentContext<IKeyManager>,
  ): Promise<any> {
    const identifier = await this.store.get({ did })
    const provider = this.getProvider(identifier.provider)
    const result = await provider.removeService({ identifier, id, options }, context)
    identifier.services = identifier.services.filter((s) => s.id !== id)
    await this.store.import(identifier)
    return result
  }
}
