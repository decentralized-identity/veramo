import { AbstractIdentifierProvider } from '../../../did-manager'
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
} from '@veramo/core'

const mockIdentifiers = new Map()
mockIdentifiers.set('did:example:111', {
  did: 'did:example:111',
  provider: 'mock',
  controllerKeyId: 'kid1',
  keys: [
    {
      kid: 'kid1',
      publicKeyHex: 'pub',
      type: 'Secp256k1',
      kms: 'mock',
    },
  ],
  services: [],
})

mockIdentifiers.set('did:example:222', {
  did: 'did:example:222',
  provider: 'mock',
  controllerKeyId: 'kid2',
  keys: [
    {
      kid: 'kid2',
      publicKeyHex: 'pub',
      type: 'Secp256k1',
      kms: 'mock',
    },
  ],
  services: [],
})

mockIdentifiers.set('did:example:333', {
  did: 'did:example:333',
  provider: 'mock',
  controllerKeyId: 'kid3',
  keys: [
    {
      kid: 'kid3',
      publicKeyHex: 'pub',
      type: 'Ed25519',
      kms: 'mock',
    },
  ],
  services: [],
})

/**
 * Agent plugin that implements {@link @veramo/core#IDIDManager} interface
 * @public
 */
export class MockDIDManager implements IAgentPlugin {
  /**
   * Plugin methods
   * @public
   */
  readonly methods: IDIDManager
  readonly schema = schema.IDIDManager

  constructor() {
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

  /** {@inheritDoc @veramo/core#IDIDManager.didManagerGetProviders} */
  async didManagerGetProviders(): Promise<string[]> {
    return []
  }

  /** {@inheritDoc @veramo/core#IDIDManager.didManagerFind} */
  async didManagerFind(args: IDIDManagerFindArgs): Promise<IIdentifier[]> {
    return [{ did: "x", provider: "y", keys: [], services: [] }]
  }

  /** {@inheritDoc @veramo/core#IDIDManager.didManagerGet} */
  async didManagerGet({ did }: IDIDManagerGetArgs): Promise<IIdentifier> {
    return mockIdentifiers.get(did)
  }

  /** {@inheritDoc @veramo/core#IDIDManager.didManagerGetByAlias} */
  async didManagerGetByAlias({ alias, provider }: IDIDManagerGetByAliasArgs): Promise<IIdentifier> {
    return { did: "x", provider: "y", keys: [], services: [] }
  }

  /** {@inheritDoc @veramo/core#IDIDManager.didManagerCreate} */
  async didManagerCreate(
    args: IDIDManagerCreateArgs,
    context: IAgentContext<IKeyManager>,
  ): Promise<IIdentifier> {
    return { did: "x", provider: "y", keys: [], services: [] }
  }

  /** {@inheritDoc @veramo/core#IDIDManager.didManagerGetOrCreate} */
  async didManagerGetOrCreate(
    { provider, alias, kms, options }: IDIDManagerGetOrCreateArgs,
    context: IAgentContext<IKeyManager>,
  ): Promise<IIdentifier> {
    return { did: "x", provider: "y", keys: [], services: [] }
  }

  /** {@inheritDoc @veramo/core#IDIDManager.didManagerUpdate} */
  async didManagerUpdate(
    { did, document, options }: IDIDManagerUpdateArgs,
    context: IAgentContext<IKeyManager>,
  ): Promise<IIdentifier> {
    return { did: "x", provider: "y", keys: [], services: [] }
  }

  /** {@inheritDoc @veramo/core#IDIDManager.didManagerSetAlias} */
  async didManagerSetAlias(
    { did, alias }: IDIDManagerSetAliasArgs,
    context: IAgentContext<IKeyManager>,
  ): Promise<boolean> {
    return true
  }

  /** {@inheritDoc @veramo/core#IDIDManager.didManagerImport} */
  async didManagerImport(
    identifier: MinimalImportableIdentifier,
    context: IAgentContext<IKeyManager>,
  ): Promise<IIdentifier> {
    return { did: "x", provider: "y", keys: [], services: [] }
  }

  /** {@inheritDoc @veramo/core#IDIDManager.didManagerDelete} */
  async didManagerDelete(
    { did }: IDIDManagerDeleteArgs,
    context: IAgentContext<IKeyManager>,
  ): Promise<boolean> {
    return true
  }

  /** {@inheritDoc @veramo/core#IDIDManager.didManagerAddKey} */
  async didManagerAddKey(
    { did, key, options }: IDIDManagerAddKeyArgs,
    context: IAgentContext<IKeyManager>,
  ): Promise<any> {
    return {}
  }

  /** {@inheritDoc @veramo/core#IDIDManager.didManagerRemoveKey} */
  async didManagerRemoveKey(
    { did, kid, options }: IDIDManagerRemoveKeyArgs,
    context: IAgentContext<IKeyManager>,
  ): Promise<any> {
    return {}
  }

  /** {@inheritDoc @veramo/core#IDIDManager.didManagerAddService} */
  async didManagerAddService(
    { did, service, options }: IDIDManagerAddServiceArgs,
    context: IAgentContext<IKeyManager>,
  ): Promise<any> {
    return {}
  }

  /** {@inheritDoc @veramo/core#IDIDManager.didManagerRemoveService} */
  async didManagerRemoveService(
    { did, id, options }: IDIDManagerRemoveServiceArgs,
    context: IAgentContext<IKeyManager>,
  ): Promise<any> {
    return {}
  }
}
