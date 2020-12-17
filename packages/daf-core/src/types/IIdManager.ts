import { IPluginMethodMap, IAgentContext } from './IAgent'
import { IIdentifier, IService, IKey } from './IIdentifier'
import { IKeyManager } from './IKeyManager'

/**
 * Input arguments for {@link IDidManager.didManagerGet | didManagerGet}
 * @public
 */
export interface IDidManagerGetArgs {
  /**
   * DID
   */
  did: string
}

/**
 * Input arguments for {@link IDidManager.didManagerFind | didManagerFind}
 * @public
 */
export interface IDidManagerFindArgs {
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
 * Input arguments for {@link IDidManager.didManagerGetByAlias | didManagerGetByAlias}
 * @public
 */
export interface IDidManagerGetByAliasArgs {
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
 * Input arguments for {@link IDidManager.didManagerDeleteIdentifier | didManagerDeleteIdentifier}
 * @public
 */
export interface IDidManagerDeleteIdentifierArgs {
  /**
   * DID
   */
  did: string
}

/**
 * Input arguments for {@link IDidManager.didManagerCreateIdentifier | didManagerCreateIdentifier}
 * @public
 */
export interface IDidManagerCreateIdentifierArgs {
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
 * Input arguments for {@link IDidManager.didManagerSetAlias | didManagerSetAlias}
 * @public
 */
export interface IDidManagerSetAliasArgs {
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
 * Input arguments for {@link IDidManager.didManagerGetOrCreateIdentifier | didManagerGetOrCreateIdentifier}
 * @public
 */
export interface IDidManagerGetOrCreateIdentifierArgs {
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
 * Input arguments for {@link IDidManager.didManagerAddKey | didManagerAddKey}
 * @public
 */
export interface IDidManagerAddKeyArgs {
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
 * Input arguments for {@link IDidManager.didManagerRemoveKey | didManagerRemoveKey}
 * @public
 */
export interface IDidManagerRemoveKeyArgs {
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
 * Input arguments for {@link IDidManager.didManagerAddService | didManagerAddService}
 * @public
 */
export interface IDidManagerAddServiceArgs {
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
 * Input arguments for {@link IDidManager.didManagerRemoveService | didManagerRemoveService}
 * @public
 */
export interface IDidManagerRemoveServiceArgs {
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
export interface IDidManager extends IPluginMethodMap {
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
  didManagerFind(args: IDidManagerFindArgs): Promise<Array<IIdentifier>>

  /**
   * Returns a specific identifier
   */
  didManagerGet(args: IDidManagerGetArgs): Promise<IIdentifier>

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
  didManagerGetByAlias(args: IDidManagerGetByAliasArgs): Promise<IIdentifier>

  /**
   * Creates and returns a new identifier
   *
   * @param args - Required. Arguments to create the identifier
   * @param context - <a href="/docs/agent/plugins#executing-plugin-methods">Execution context</a>. Requires `agent` that has {@link daf-core#IKeyManager} methods
   *
   * @example
   * ```typescript
   * const identifier = await agent.didManagerCreateIdentifier({
   *   alias: 'alice',
   *   provider: 'did:ethr:rinkeby',
   *   kms: 'local'
   * })
   * ```
   */
  didManagerCreateIdentifier(
    args: IDidManagerCreateIdentifierArgs,
    context: IAgentContext<IKeyManager>,
  ): Promise<IIdentifier>

  /**
   * Sets identifier alias
   *
   * @param args - Required. Arguments to set identifier alias
   * @param context - <a href="/docs/agent/plugins#executing-plugin-methods">Execution context</a>. Requires `agent` that has {@link daf-core#IKeyManager} methods
   *
   * @example
   * ```typescript
   * const identifier = await agent.didManagerCreateIdentifier()
   * const result = await agent.didManagerSetAlias({
   *   did: identifier.did,
   *   alias: 'carol',
   * })
   * ```
   */
  didManagerSetAlias(args: IDidManagerSetAliasArgs, context: IAgentContext<IKeyManager>): Promise<boolean>

  /**
   * Returns an existing identifier or creates a new one for a specific alias
   */
  didManagerGetOrCreateIdentifier(
    args: IDidManagerGetOrCreateIdentifierArgs,
    context: IAgentContext<IKeyManager>,
  ): Promise<IIdentifier>

  /**
   * Imports identifier
   */
  didManagerImportIdentifier(args: IIdentifier, context: IAgentContext<IKeyManager>): Promise<IIdentifier>

  /**
   * Deletes identifier
   */
  didManagerDeleteIdentifier(
    args: IDidManagerDeleteIdentifierArgs,
    context: IAgentContext<IKeyManager>,
  ): Promise<boolean>

  /**
   * Adds a key to a DID Document
   * @returns identifier provider specific response. Can be txHash, etc,
   */
  didManagerAddKey(args: IDidManagerAddKeyArgs, context: IAgentContext<IKeyManager>): Promise<any>

  /**
   * Removes a key from a DID Document
   * @returns identifier provider specific response. Can be txHash, etc,
   */
  didManagerRemoveKey(args: IDidManagerRemoveKeyArgs, context: IAgentContext<IKeyManager>): Promise<any> // txHash?

  /**
   * Adds a service to a DID Document
   * @returns identifier provider specific response. Can be txHash, etc,
   */
  didManagerAddService(args: IDidManagerAddServiceArgs, context: IAgentContext<IKeyManager>): Promise<any> //txHash?

  /**
   * Removes a service from a DID Document
   * @returns identifier provider specific response. Can be txHash, etc,
   */
  didManagerRemoveService(
    args: IDidManagerRemoveServiceArgs,
    context: IAgentContext<IKeyManager>,
  ): Promise<any> //txHash?
}
