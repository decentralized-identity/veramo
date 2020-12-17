import { IPluginMethodMap, IAgentContext } from './IAgent'
import { IIdentifier, IService, IKey } from './IIdentifier'
import { IKeyManager } from './IKeyManager'

/**
 * Input arguments for {@link IDIDManager.didManagerGet | didManagerGet}
 * @public
 */
export interface IDIDManagerGetArgs {
  /**
   * DID
   */
  did: string
}

/**
 * Input arguments for {@link IDIDManager.didManagerFind | didManagerFind}
 * @public
 */
export interface IDIDManagerFindArgs {
  /**
   * Optional. Alias
   */
  alias?: string

  /**
   * Optional. Provider
   */
  provider?: string
}

/**
 * Input arguments for {@link IDIDManager.didManagerGetByAlias | didManagerGetByAlias}
 * @public
 */
export interface IDIDManagerGetByAliasArgs {
  /**
   * Alias
   */
  alias: string

  /**
   * Optional provider
   */
  provider?: string
}

/**
 * Input arguments for {@link IDIDManager.didManagerDelete | didManagerDelete}
 * @public
 */
export interface IDIDManagerDeleteArgs {
  /**
   * DID
   */
  did: string
}

/**
 * Input arguments for {@link IDIDManager.didManagerCreate | didManagerCreate}
 * @public
 */
export interface IDIDManagerCreateArgs {
  /**
   * Optional. Identifier alias. Can be used to reference an object in an external system
   */
  alias?: string

  /**
   * Optional. Identifier provider
   */
  provider?: string

  /**
   * Optional. Key Management System
   */
  kms?: string

  /**
   * Optional. Identifier provider specific options
   */
  options?: object
}

/**
 * Input arguments for {@link IDIDManager.didManagerSetAlias | didManagerSetAlias}
 * @public
 */
export interface IDIDManagerSetAliasArgs {
  /**
   * Required. DID
   */
  did: string

  /**
   * Required. Identifier alias
   */
  alias: string
}

/**
 * Input arguments for {@link IDIDManager.didManagerGetOrCreate | didManagerGetOrCreate}
 * @public
 */
export interface IDIDManagerGetOrCreateArgs {
  /**
   * Identifier alias. Can be used to reference an object in an external system
   */
  alias: string

  /**
   * Optional. Identifier provider
   */
  provider?: string

  /**
   * Optional. Key Management System
   */
  kms?: string

  /**
   * Optional. Identifier provider specific options
   */
  options?: object
}

/**
 * Input arguments for {@link IDIDManager.didManagerAddKey | didManagerAddKey}
 * @public
 */
export interface IDIDManagerAddKeyArgs {
  /**
   * DID
   */
  did: string

  /**
   * Key object
   */
  key: IKey

  /**
   * Optional. Identifier provider specific options
   */
  options?: object
}

/**
 * Input arguments for {@link IDIDManager.didManagerRemoveKey | didManagerRemoveKey}
 * @public
 */
export interface IDIDManagerRemoveKeyArgs {
  /**
   * DID
   */
  did: string

  /**
   * Key ID
   */
  kid: string

  /**
   * Optional. Identifier provider specific options
   */
  options?: object
}

/**
 * Input arguments for {@link IDIDManager.didManagerAddService | didManagerAddService}
 * @public
 */
export interface IDIDManagerAddServiceArgs {
  /**
   * DID
   */
  did: string

  /**
   * Service object
   */
  service: IService

  /**
   * Optional. Identifier provider specific options
   */
  options?: object
}

/**
 * Input arguments for {@link IDIDManager.didManagerRemoveService | didManagerRemoveService}
 * @public
 */
export interface IDIDManagerRemoveServiceArgs {
  /**
   * DID
   */
  did: string

  /**
   * Service ID
   */
  id: string

  /**
   * Optional. Identifier provider specific options
   */
  options?: object
}

/**
 * Identifier manager interface
 * @public
 */
export interface IDIDManager extends IPluginMethodMap {
  /**
   * Returns a list of available identifier providers
   */
  didManagerGetProviders(): Promise<Array<string>>

  /**
   * Returns a list of managed identifiers
   *
   * @param args - Required. Arguments to get the list of identifiers
   * @param context - <a href="/docs/agent/plugins#executing-plugin-methods">Execution context</a>. Requires `agent` that has {@link daf-core#IKeyManager} methods
   *
   * @example
   * ```typescript
   * const aliceIdentifiers = await agent.didManagerFind({
   *   alias: 'alice'
   * })
   *
   * const rinkebyIdentifiers = await agent.didManagerFind({
   *   provider: 'did:ethr:rinkeby'
   * })
   * ```
   */
  didManagerFind(args: IDIDManagerFindArgs): Promise<Array<IIdentifier>>

  /**
   * Returns a specific identifier
   */
  didManagerGet(args: IDIDManagerGetArgs): Promise<IIdentifier>

  /**
   * Returns a specific identifier by alias
   *
   * @param args - Required. Arguments to get the identifier
   * @param context - <a href="/docs/agent/plugins#executing-plugin-methods">Execution context</a>. Requires `agent` that has {@link daf-core#IKeyManager} methods
   *
   * @example
   * ```typescript
   * const identifier = await agent.didManagerGetByAlias({
   *   alias: 'alice',
   *   provider: 'did:ethr:rinkeby'
   * })
   * ```
   */
  didManagerGetByAlias(args: IDIDManagerGetByAliasArgs): Promise<IIdentifier>

  /**
   * Creates and returns a new identifier
   *
   * @param args - Required. Arguments to create the identifier
   * @param context - <a href="/docs/agent/plugins#executing-plugin-methods">Execution context</a>. Requires `agent` that has {@link daf-core#IKeyManager} methods
   *
   * @example
   * ```typescript
   * const identifier = await agent.didManagerCreate({
   *   alias: 'alice',
   *   provider: 'did:ethr:rinkeby',
   *   kms: 'local'
   * })
   * ```
   */
  didManagerCreate(args: IDIDManagerCreateArgs, context: IAgentContext<IKeyManager>): Promise<IIdentifier>

  /**
   * Sets identifier alias
   *
   * @param args - Required. Arguments to set identifier alias
   * @param context - <a href="/docs/agent/plugins#executing-plugin-methods">Execution context</a>. Requires `agent` that has {@link daf-core#IKeyManager} methods
   *
   * @example
   * ```typescript
   * const identifier = await agent.didManagerCreate()
   * const result = await agent.didManagerSetAlias({
   *   did: identifier.did,
   *   alias: 'carol',
   * })
   * ```
   */
  didManagerSetAlias(args: IDIDManagerSetAliasArgs, context: IAgentContext<IKeyManager>): Promise<boolean>

  /**
   * Returns an existing identifier or creates a new one for a specific alias
   */
  didManagerGetOrCreate(
    args: IDIDManagerGetOrCreateArgs,
    context: IAgentContext<IKeyManager>,
  ): Promise<IIdentifier>

  /**
   * Imports identifier
   */
  didManagerImport(args: IIdentifier, context: IAgentContext<IKeyManager>): Promise<IIdentifier>

  /**
   * Deletes identifier
   */
  didManagerDelete(args: IDIDManagerDeleteArgs, context: IAgentContext<IKeyManager>): Promise<boolean>

  /**
   * Adds a key to a DID Document
   * @returns identifier provider specific response. Can be txHash, etc,
   */
  didManagerAddKey(args: IDIDManagerAddKeyArgs, context: IAgentContext<IKeyManager>): Promise<any>

  /**
   * Removes a key from a DID Document
   * @returns identifier provider specific response. Can be txHash, etc,
   */
  didManagerRemoveKey(args: IDIDManagerRemoveKeyArgs, context: IAgentContext<IKeyManager>): Promise<any> // txHash?

  /**
   * Adds a service to a DID Document
   * @returns identifier provider specific response. Can be txHash, etc,
   */
  didManagerAddService(args: IDIDManagerAddServiceArgs, context: IAgentContext<IKeyManager>): Promise<any> //txHash?

  /**
   * Removes a service from a DID Document
   * @returns identifier provider specific response. Can be txHash, etc,
   */
  didManagerRemoveService(
    args: IDIDManagerRemoveServiceArgs,
    context: IAgentContext<IKeyManager>,
  ): Promise<any> //txHash?
}
