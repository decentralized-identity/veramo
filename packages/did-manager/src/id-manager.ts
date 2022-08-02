import { AbstractIdentifierProvider } from './abstract-identifier-provider'
import {
  IAgentPlugin,
  IIdentifier,
  IAgentContext,
  IDIDManager,
  IKeyManager,
  IDIDManagerGetArgs,
  IDIDManagerCreateArgs,
  IDIDManagerGetByAliasArgs,
  IDIDManagerGetOrCreateArgs,
  IDIDManagerUpdateArgs,
  IDIDManagerDeleteArgs,
  IDIDManagerAddKeyArgs,
  IDIDManagerRemoveKeyArgs,
  IDIDManagerAddServiceArgs,
  IDIDManagerRemoveServiceArgs,
  IDIDManagerFindArgs,
  IDIDManagerSetAliasArgs,
  schema,
  MinimalImportableIdentifier,
  IKey,
  IService,
} from '@veramo/core'
import { AbstractDIDStore } from './abstract-identifier-store'

/**
 * Agent plugin that implements {@link @veramo/core#IDIDManager} interface
 * @public
 */
export class DIDManager implements IAgentPlugin {
  /**
   * Plugin methods
   * @public
   */
  readonly methods: IDIDManager
  readonly schema = schema.IDIDManager

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
      didManagerFind: this.didManagerFind.bind(this),
      didManagerGet: this.didManagerGet.bind(this),
      didManagerGetByAlias: this.didManagerGetByAlias.bind(this),
      didManagerCreate: this.didManagerCreate.bind(this),
      didManagerSetAlias: this.didManagerSetAlias.bind(this),
      didManagerGetOrCreate: this.didManagerGetOrCreate.bind(this),
      didManagerUpdate: this.didManagerUpdate.bind(this),
      didManagerImport: this.didManagerImport.bind(this),
      didManagerDelete: this.didManagerDelete.bind(this),
      didManagerAddKey: this.didManagerAddKey.bind(this),
      didManagerRemoveKey: this.didManagerRemoveKey.bind(this),
      didManagerAddService: this.didManagerAddService.bind(this),
      didManagerRemoveService: this.didManagerRemoveService.bind(this),
    }
  }

  private getProvider(name: string): AbstractIdentifierProvider {
    let provider: AbstractIdentifierProvider | undefined = this.providers[name]
    if (!provider) {
      provider = Object.values(this.providers).find(
        (p) => typeof p.matchPrefix === 'function' && p.matchPrefix(name),
      )
    }
    if (!provider) throw Error('Identifier provider does not exist: ' + name)
    return provider
  }

  /** {@inheritDoc @veramo/core#IDIDManager.didManagerGetProviders} */
  async didManagerGetProviders(): Promise<string[]> {
    return Object.keys(this.providers)
  }

  /** {@inheritDoc @veramo/core#IDIDManager.didManagerFind} */
  async didManagerFind(args: IDIDManagerFindArgs): Promise<IIdentifier[]> {
    return this.store.list(args)
  }

  /** {@inheritDoc @veramo/core#IDIDManager.didManagerGet} */
  async didManagerGet({ did }: IDIDManagerGetArgs): Promise<IIdentifier> {
    return this.store.get({ did })
  }

  /** {@inheritDoc @veramo/core#IDIDManager.didManagerGetByAlias} */
  async didManagerGetByAlias({ alias, provider }: IDIDManagerGetByAliasArgs): Promise<IIdentifier> {
    const providerName = provider || this.defaultProvider
    return this.store.get({ alias, provider: providerName })
  }

  /** {@inheritDoc @veramo/core#IDIDManager.didManagerCreate} */
  async didManagerCreate(
    args: IDIDManagerCreateArgs,
    context: IAgentContext<IKeyManager>,
  ): Promise<IIdentifier> {
    const providerName = args?.provider || this.defaultProvider
    if (args?.alias !== undefined) {
      let existingIdentifier
      try {
        existingIdentifier = await this.store.get({ alias: args.alias, provider: providerName })
      } catch (e) {}
      if (existingIdentifier) {
        throw Error(
          `illegal_argument: Identifier with alias: ${args.alias}, provider: ${providerName} already exists: ${existingIdentifier.did}`,
        )
      }
    }
    const identifierProvider = this.getProvider(providerName)
    const partialIdentifier = await identifierProvider.createIdentifier(
      { kms: args?.kms, alias: args?.alias, options: { providerName, ...args?.options } },
      context,
    )
    const identifier: IIdentifier = { ...partialIdentifier, provider: providerName }
    if (args?.alias) {
      identifier.alias = args.alias
    }
    await this.store.import(identifier)
    return identifier
  }

  /** {@inheritDoc @veramo/core#IDIDManager.didManagerGetOrCreate} */
  async didManagerGetOrCreate(
    { provider, alias, kms, options }: IDIDManagerGetOrCreateArgs,
    context: IAgentContext<IKeyManager>,
  ): Promise<IIdentifier> {
    try {
      const providerName = provider || this.defaultProvider
      // @ts-ignore
      const identifier = await this.store.get({ alias, provider: providerName })
      return identifier
    } catch {
      return this.didManagerCreate({ provider, alias, kms, options }, context)
    }
  }

  /** {@inheritDoc @veramo/core#IDIDManager.didManagerUpdate} */
  async didManagerUpdate(
    { did, document, options }: IDIDManagerUpdateArgs,
    context: IAgentContext<IKeyManager>,
  ): Promise<IIdentifier> {
    /**
     * 1. Check if the identifier is already in the store
     * 2. If not, throw
     * 3. Check if provider implements updateIdentifier (handles ledger resolution logic)
     * 4. If not, throw
     * 5. If yes, execute updateIdentifier
     * 6. Update the identifier in the store
     * 7. Return the identifier
     */
      const identifier = await this.store.get({ did })
      const identifierProvider = this.getProvider(identifier.provider)
      if (typeof identifierProvider?.updateIdentifier !== 'function') {
        throw new Error(`not_supported: ${identifier?.provider} provider does not implement full document updates`)
      }
      const updatedIdentifier = await identifierProvider.updateIdentifier(
        { did, document, options },
        context,
      )
      await this.store.import(updatedIdentifier)
      return updatedIdentifier
  }

  /** {@inheritDoc @veramo/core#IDIDManager.didManagerSetAlias} */
  async didManagerSetAlias(
    { did, alias }: IDIDManagerSetAliasArgs,
    context: IAgentContext<IKeyManager>,
  ): Promise<boolean> {
    const identifier = await this.store.get({ did })
    identifier.alias = alias
    return await this.store.import(identifier)
  }

  /** {@inheritDoc @veramo/core#IDIDManager.didManagerImport} */
  async didManagerImport(
    identifier: MinimalImportableIdentifier,
    context: IAgentContext<IKeyManager>,
  ): Promise<IIdentifier> {
    const keys: IKey[] = []
    for (const key of identifier.keys) {
      const importedKey = await context.agent.keyManagerImport(key)
      keys.push(importedKey)
    }
    const services: IService[] = [...(identifier?.services || [])]
    const importedDID = {
      ...identifier,
      keys,
      services,
    }
    await this.store.import(importedDID)
    return importedDID
  }

  /** {@inheritDoc @veramo/core#IDIDManager.didManagerDelete} */
  async didManagerDelete(
    { did }: IDIDManagerDeleteArgs,
    context: IAgentContext<IKeyManager>,
  ): Promise<boolean> {
    const identifier = await this.store.get({ did })
    const provider = this.getProvider(identifier.provider)
    await provider.deleteIdentifier(identifier, context)
    return this.store.delete({ did })
  }

  /** {@inheritDoc @veramo/core#IDIDManager.didManagerAddKey} */
  async didManagerAddKey(
    { did, key, options }: IDIDManagerAddKeyArgs,
    context: IAgentContext<IKeyManager>,
  ): Promise<any> {
    const identifier = await this.store.get({ did })
    const provider = this.getProvider(identifier.provider)
    const result = await provider.addKey({ identifier, key, options }, context)
    identifier.keys.push(key)
    await this.store.import(identifier)
    return result
  }

  /** {@inheritDoc @veramo/core#IDIDManager.didManagerRemoveKey} */
  async didManagerRemoveKey(
    { did, kid, options }: IDIDManagerRemoveKeyArgs,
    context: IAgentContext<IKeyManager>,
  ): Promise<any> {
    const identifier = await this.store.get({ did })
    const provider = this.getProvider(identifier.provider)
    const result = await provider.removeKey({ identifier, kid, options }, context)
    identifier.keys = identifier.keys.filter((k) => k.kid !== kid)
    await this.store.import(identifier)
    return result
  }

  /** {@inheritDoc @veramo/core#IDIDManager.didManagerAddService} */
  async didManagerAddService(
    { did, service, options }: IDIDManagerAddServiceArgs,
    context: IAgentContext<IKeyManager>,
  ): Promise<any> {
    const identifier = await this.store.get({ did })
    const provider = this.getProvider(identifier.provider)
    const result = await provider.addService({ identifier, service, options }, context)
    identifier.services.push(service)
    await this.store.import(identifier)
    return result
  }

  /** {@inheritDoc @veramo/core#IDIDManager.didManagerRemoveService} */
  async didManagerRemoveService(
    { did, id, options }: IDIDManagerRemoveServiceArgs,
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
