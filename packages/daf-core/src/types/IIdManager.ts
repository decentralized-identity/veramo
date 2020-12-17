import { IPluginMethodMap, IAgentContext } from './IAgent'
import { IIdentifier, IService, IKey } from './IIdentifier'
import { IKeyManager } from './IKeyManager'

/**
 * Input arguments for {@link IIdManager.idManagerGetIdentifier | idManagerGetIdentifier}
 * @public
 */
export interface IIdManagerGetIdentifierArgs {
  /**
   * DID
   */
  did: string
}

/**
 * Input arguments for {@link IIdManager.idManagerGetIdentifiers | idManagerGetIdentifiers}
 * @public
 */
export interface IIdManagerGetIdentifiersArgs {
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
 * Input arguments for {@link IIdManager.idManagerGetIdentifierByAlias | idManagerGetIdentifierByAlias}
 * @public
 */
export interface IIdManagerGetIdentifierByAliasArgs {
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
 * Input arguments for {@link IIdManager.idManagerDeleteIdentifier | idManagerDeleteIdentifier}
 * @public
 */
export interface IIdManagerDeleteIdentifierArgs {
  /**
   * DID
   */
  did: string
}

/**
 * Input arguments for {@link IIdManager.idManagerCreateIdentifier | idManagerCreateIdentifier}
 * @public
 */
export interface IIdManagerCreateIdentifierArgs {
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
 * Input arguments for {@link IIdManager.idManagerSetAlias | idManagerSetAlias}
 * @public
 */
export interface IIdManagerSetAliasArgs {
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
 * Input arguments for {@link IIdManager.idManagerGetOrCreateIdentifier | idManagerGetOrCreateIdentifier}
 * @public
 */
export interface IIdManagerGetOrCreateIdentifierArgs {
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
 * Input arguments for {@link IIdManager.idManagerAddKey | idManagerAddKey}
 * @public
 */
export interface IIdManagerAddKeyArgs {
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
 * Input arguments for {@link IIdManager.idManagerRemoveKey | idManagerRemoveKey}
 * @public
 */
export interface IIdManagerRemoveKeyArgs {
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
 * Input arguments for {@link IIdManager.idManagerAddService | idManagerAddService}
 * @public
 */
export interface IIdManagerAddServiceArgs {
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
 * Input arguments for {@link IIdManager.idManagerRemoveService | idManagerRemoveService}
 * @public
 */
export interface IIdManagerRemoveServiceArgs {
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
export interface IIdManager extends IPluginMethodMap {
  /**
   * Returns a list of available identifier providers
   */
  idManagerGetProviders(): Promise<Array<string>>

  /**
   * Returns a list of managed identifiers
   *
   * @param args - Required. Arguments to get the list of identifiers
   * @param context - <a href="/docs/agent/plugins#executing-plugin-methods">Execution context</a>. Requires `agent` that has {@link daf-core#IKeyManager} methods
   *
   * @example
   * ```typescript
   * const aliceIdentifiers = await agent.idManagerGetIdentifiers({
   *   alias: 'alice'
   * })
   *
   * const rinkebyIdentifiers = await agent.idManagerGetIdentifiers({
   *   provider: 'did:ethr:rinkeby'
   * })
   * ```
   */
  idManagerGetIdentifiers(args: IIdManagerGetIdentifiersArgs): Promise<Array<IIdentifier>>

  /**
   * Returns a specific identifier
   */
  idManagerGetIdentifier(args: IIdManagerGetIdentifierArgs): Promise<IIdentifier>

  /**
   * Returns a specific identifier by alias
   *
   * @param args - Required. Arguments to get the identifier
   * @param context - <a href="/docs/agent/plugins#executing-plugin-methods">Execution context</a>. Requires `agent` that has {@link daf-core#IKeyManager} methods
   *
   * @example
   * ```typescript
   * const identifier = await agent.idManagerGetIdentifierByAlias({
   *   alias: 'alice',
   *   provider: 'did:ethr:rinkeby'
   * })
   * ```
   */
  idManagerGetIdentifierByAlias(args: IIdManagerGetIdentifierByAliasArgs): Promise<IIdentifier>

  /**
   * Creates and returns a new identifier
   *
   * @param args - Required. Arguments to create the identifier
   * @param context - <a href="/docs/agent/plugins#executing-plugin-methods">Execution context</a>. Requires `agent` that has {@link daf-core#IKeyManager} methods
   *
   * @example
   * ```typescript
   * const identifier = await agent.idManagerCreateIdentifier({
   *   alias: 'alice',
   *   provider: 'did:ethr:rinkeby',
   *   kms: 'local'
   * })
   * ```
   */
  idManagerCreateIdentifier(
    args: IIdManagerCreateIdentifierArgs,
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
   * const identifier = await agent.idManagerCreateIdentifier()
   * const result = await agent.idManagerSetAlias({
   *   did: identifier.did,
   *   alias: 'carol',
   * })
   * ```
   */
  idManagerSetAlias(args: IIdManagerSetAliasArgs, context: IAgentContext<IKeyManager>): Promise<boolean>

  /**
   * Returns an existing identifier or creates a new one for a specific alias
   */
  idManagerGetOrCreateIdentifier(
    args: IIdManagerGetOrCreateIdentifierArgs,
    context: IAgentContext<IKeyManager>,
  ): Promise<IIdentifier>

  /**
   * Imports identifier
   */
  idManagerImportIdentifier(args: IIdentifier, context: IAgentContext<IKeyManager>): Promise<IIdentifier>

  /**
   * Deletes identifier
   */
  idManagerDeleteIdentifier(
    args: IIdManagerDeleteIdentifierArgs,
    context: IAgentContext<IKeyManager>,
  ): Promise<boolean>

  /**
   * Adds a key to a DID Document
   * @returns identifier provider specific response. Can be txHash, etc,
   */
  idManagerAddKey(args: IIdManagerAddKeyArgs, context: IAgentContext<IKeyManager>): Promise<any>

  /**
   * Removes a key from a DID Document
   * @returns identifier provider specific response. Can be txHash, etc,
   */
  idManagerRemoveKey(args: IIdManagerRemoveKeyArgs, context: IAgentContext<IKeyManager>): Promise<any> // txHash?

  /**
   * Adds a service to a DID Document
   * @returns identifier provider specific response. Can be txHash, etc,
   */
  idManagerAddService(args: IIdManagerAddServiceArgs, context: IAgentContext<IKeyManager>): Promise<any> //txHash?

  /**
   * Removes a service from a DID Document
   * @returns identifier provider specific response. Can be txHash, etc,
   */
  idManagerRemoveService(args: IIdManagerRemoveServiceArgs, context: IAgentContext<IKeyManager>): Promise<any> //txHash?
}
