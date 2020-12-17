import { AbstractIdentifierProvider } from './abstract-identifier-provider'
import {
  IAgentPlugin,
  IIdentifier,
  IAgentContext,
  IDidManager,
  IKeyManager,
  IDidManagerGetIdentifierArgs,
  IDidManagerCreateIdentifierArgs,
  IDidManagerGetIdentifierByAliasArgs,
  IDidManagerGetOrCreateIdentifierArgs,
  IDidManagerDeleteIdentifierArgs,
  IDidManagerAddKeyArgs,
  IDidManagerRemoveKeyArgs,
  IDidManagerAddServiceArgs,
  IDidManagerRemoveServiceArgs,
  IDdidManagerFindArgs,
  IDidManagerSetAliasArgs,
  schema,
} from 'daf-core'
import { AbstractDIDStore } from './abstract-identifier-store'

/**
 * Agent plugin that implements {@link daf-core#IDidManager} interface
 * @public
 */
export class DidManager implements IAgentPlugin {
  /**
   * Plugin methods
   * @public
   */
  readonly methods: IDidManager
  readonly schema = schema.IDidManager

  private providers: Record<string, AbstractIdentifierProvider>
  private defaultProvider: string
  private store: AbstractDIDStore

  constructor(options: {
    providers: Record<string, AbstractIdentifierProvider>
    defaultProvider: string
    store: AbstractDIDStore
  }) {
    this.providers = options.providers
    this.defaultProvider = options.defaultProvider
    this.store = options.store
    this.methods = {
      didManagerGetProviders: this.didManagerGetProviders.bind(this),
      ddidManagerFind: this.ddidManagerFind.bind(this),
      didManagerGetIdentifier: this.didManagerGetIdentifier.bind(this),
      didManagerGetIdentifierByAlias: this.didManagerGetIdentifierByAlias.bind(this),
      didManagerCreateIdentifier: this.didManagerCreateIdentifier.bind(this),
      didManagerSetAlias: this.didManagerSetAlias.bind(this),
      didManagerGetOrCreateIdentifier: this.didManagerGetOrCreateIdentifier.bind(this),
      didManagerImportIdentifier: this.didManagerImportIdentifier.bind(this),
      didManagerDeleteIdentifier: this.didManagerDeleteIdentifier.bind(this),
      didManagerAddKey: this.didManagerAddKey.bind(this),
      didManagerRemoveKey: this.didManagerRemoveKey.bind(this),
      didManagerAddService: this.didManagerAddService.bind(this),
      didManagerRemoveService: this.didManagerRemoveService.bind(this),
    }
  }

  private getProvider(name: string): AbstractIdentifierProvider {
    const provider = this.providers[name]
    if (!provider) throw Error('Identifier provider does not exist: ' + name)
    return provider
  }

  /** {@inheritDoc daf-core#IDidManager.didManagerGetProviders} */
  async didManagerGetProviders(): Promise<string[]> {
    return Object.keys(this.providers)
  }

  /** {@inheritDoc daf-core#IDidManager.ddidManagerFind} */
  async ddidManagerFind(args: IDdidManagerFindArgs): Promise<IIdentifier[]> {
    return this.store.list(args)
  }

  /** {@inheritDoc daf-core#IDidManager.didManagerGetIdentifier} */
  async didManagerGetIdentifier({ did }: IDidManagerGetIdentifierArgs): Promise<IIdentifier> {
    return this.store.get({ did })
  }

  /** {@inheritDoc daf-core#IDidManager.didManagerGetIdentifierByAlias} */
  async didManagerGetIdentifierByAlias({
    alias,
    provider,
  }: IDidManagerGetIdentifierByAliasArgs): Promise<IIdentifier> {
    const providerName = provider || this.defaultProvider
    return this.store.get({ alias, provider: providerName })
  }

  /** {@inheritDoc daf-core#IDidManager.didManagerCreateIdentifier} */
  async didManagerCreateIdentifier(
    args: IDidManagerCreateIdentifierArgs,
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

  /** {@inheritDoc daf-core#IDidManager.didManagerGetOrCreateIdentifier} */
  async didManagerGetOrCreateIdentifier(
    { provider, alias, kms, options }: IDidManagerGetOrCreateIdentifierArgs,
    context: IAgentContext<IKeyManager>,
  ): Promise<IIdentifier> {
    try {
      const providerName = provider || this.defaultProvider
      const identifier = await this.store.get({ alias, provider: providerName })
      return identifier
    } catch {
      return this.didManagerCreateIdentifier({ provider, alias, kms, options }, context)
    }
  }

  /** {@inheritDoc daf-core#IDidManager.didManagerSetAlias} */
  async didManagerSetAlias(
    { did, alias }: IDidManagerSetAliasArgs,
    context: IAgentContext<IKeyManager>,
  ): Promise<boolean> {
    const identifier = await this.store.get({ did })
    identifier.alias = alias
    return await this.store.import(identifier)
  }
  /** {@inheritDoc daf-core#IDidManager.didManagerImportIdentifier} */
  async didManagerImportIdentifier(
    identifier: IIdentifier,
    context: IAgentContext<IKeyManager>,
  ): Promise<IIdentifier> {
    for (const key of identifier.keys) {
      await context.agent.keyManagerImportKey(key)
    }
    await this.store.import(identifier)
    return identifier
  }

  /** {@inheritDoc daf-core#IDidManager.didManagerDeleteIdentifier} */
  async didManagerDeleteIdentifier(
    { did }: IDidManagerDeleteIdentifierArgs,
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

  /** {@inheritDoc daf-core#IDidManager.didManagerAddKey} */
  async didManagerAddKey(
    { did, key, options }: IDidManagerAddKeyArgs,
    context: IAgentContext<IKeyManager>,
  ): Promise<any> {
    const identifier = await this.store.get({ did })
    const provider = this.getProvider(identifier.provider)
    const result = await provider.addKey({ identifier, key, options }, context)
    identifier.keys.push(key)
    await this.store.import(identifier)
    return result
  }

  /** {@inheritDoc daf-core#IDidManager.didManagerRemoveKey} */
  async didManagerRemoveKey(
    { did, kid, options }: IDidManagerRemoveKeyArgs,
    context: IAgentContext<IKeyManager>,
  ): Promise<any> {
    const identifier = await this.store.get({ did })
    const provider = this.getProvider(identifier.provider)
    const result = await provider.removeKey({ identifier, kid, options }, context)
    identifier.keys = identifier.keys.filter((k) => k.kid !== kid)
    await this.store.import(identifier)
    return result
  }

  /** {@inheritDoc daf-core#IDidManager.didManagerAddService} */
  async didManagerAddService(
    { did, service, options }: IDidManagerAddServiceArgs,
    context: IAgentContext<IKeyManager>,
  ): Promise<any> {
    const identifier = await this.store.get({ did })
    const provider = this.getProvider(identifier.provider)
    const result = await provider.addService({ identifier, service, options }, context)
    identifier.services.push(service)
    await this.store.import(identifier)
    return result
  }

  /** {@inheritDoc daf-core#IDidManager.didManagerRemoveService} */
  async didManagerRemoveService(
    { did, id, options }: IDidManagerRemoveServiceArgs,
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
