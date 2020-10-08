import { IPluginMethodMap, IAgentContext } from './IAgent'
import { IIdentity, IService, IKey } from './IIdentity'
import { IKeyManager } from './IKeyManager'

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
 * Input arguments for {@link IIdentityManager.identityManagerGetIdentities | identityManagerGetIdentities}
 * @public
 */
export interface IIdentityManagerGetIdentitiesArgs {
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
 * Input arguments for {@link IIdentityManager.identityManagerGetIdentityByAlias | identityManagerGetIdentityByAlias}
 * @public
 */
export interface IIdentityManagerGetIdentityByAliasArgs {
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
  options?: object
}

/**
 * Input arguments for {@link IIdentityManager.identityManagerSetAlias | identityManagerSetAlias}
 * @public
 */
export interface IIdentityManagerSetAliasArgs {
  /**
   * Required. DID
   */
  did: string

  /**
   * Required. Identity alias
   */
  alias: string
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
  options?: object
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
  options?: object
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
  options?: object
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
  options?: object
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
  options?: object
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
   *
   * @param args - Required. Arguments to get the list of identities
   * @param context - <a href="../plugin.md#executing-plugin-methods">Execution context</a>. Requires `agent` that has {@link daf-core#IKeyManager} methods
   *
   * @example
   * ```typescript
   * const aliceIdentities = await agent.identityManagerGetIdentities({
   *   alias: 'alice'
   * })
   *
   * const rinkebyIdentities = await agent.identityManagerGetIdentities({
   *   provider: 'did:ethr:rinkeby'
   * })
   * ```
   */
  identityManagerGetIdentities(args: IIdentityManagerGetIdentitiesArgs): Promise<Array<IIdentity>>

  /**
   * Returns a specific identity
   */
  identityManagerGetIdentity(args: IIdentityManagerGetIdentityArgs): Promise<IIdentity>

  /**
   * Returns a specific identity by alias
   *
   * @param args - Required. Arguments to get the identity
   * @param context - <a href="../plugin.md#executing-plugin-methods">Execution context</a>. Requires `agent` that has {@link daf-core#IKeyManager} methods
   *
   * @example
   * ```typescript
   * const identity = await agent.identityManagerGetIdentityByAlias({
   *   alias: 'alice',
   *   provider: 'did:ethr:rinkeby'
   * })
   * ```
   */
  identityManagerGetIdentityByAlias(args: IIdentityManagerGetIdentityByAliasArgs): Promise<IIdentity>

  /**
   * Creates and returns a new identity
   *
   * @param args - Required. Arguments to create the identity
   * @param context - <a href="../plugin.md#executing-plugin-methods">Execution context</a>. Requires `agent` that has {@link daf-core#IKeyManager} methods
   *
   * @example
   * ```typescript
   * const identity = await agent.identityManagerCreateIdentity({
   *   alias: 'alice',
   *   provider: 'did:ethr:rinkeby',
   *   kms: 'local'
   * })
   * ```
   */
  identityManagerCreateIdentity(
    args: IIdentityManagerCreateIdentityArgs,
    context: IAgentContext<IKeyManager>,
  ): Promise<IIdentity>

  /**
   * Sets identity alias
   *
   * @param args - Required. Arguments to set identity alias
   * @param context - <a href="../plugin.md#executing-plugin-methods">Execution context</a>. Requires `agent` that has {@link daf-core#IKeyManager} methods
   *
   * @example
   * ```typescript
   * const identity = await agent.identityManagerCreateIdentity()
   * const result = await agent.identityManagerSetAlias({
   *   did: identity.did,
   *   alias: 'carol',
   * })
   * ```
   */
  identityManagerSetAlias(
    args: IIdentityManagerSetAliasArgs,
    context: IAgentContext<IKeyManager>,
  ): Promise<boolean>

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
  identityManagerImportIdentity(args: IIdentity, context: IAgentContext<IKeyManager>): Promise<IIdentity>

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
