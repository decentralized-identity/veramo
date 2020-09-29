import { DIDDocument } from 'did-resolver'
import { Verifiable, W3CCredential, W3CPresentation } from 'did-jwt-vc'
export { W3CCredential, W3CPresentation }
export { DIDDocument } from 'did-resolver'
/**
 * Verifiable Credential {@link https://github.com/decentralized-identity/did-jwt-vc}
 * @public
 */
export type VerifiableCredential = Verifiable<W3CCredential>

/**
 * Verifiable Presentation {@link https://github.com/decentralized-identity/did-jwt-vc}
 * @public
 */
export type VerifiablePresentation = Verifiable<W3CPresentation>

/**
 * Cryptographic key type
 * @public
 */
export type TKeyType = 'Ed25519' | 'Secp256k1'

/**
 * Cryptographic key
 * @public
 */
export interface IKey {
  /**
   * Key ID
   */
  kid: string

  /**
   * Key Management System
   */
  kms: string

  /**
   * Key type
   */
  type: TKeyType

  /**
   * Public key
   */
  publicKeyHex: string

  /**
   * Optional. Private key
   */
  privateKeyHex?: string

  /**
   * Optional. Key metadata. Can be used to store auth data to access remote kms
   */
  meta?: object
}

/**
 * Identity service
 * @public
 */
export interface IService {
  /**
   * ID
   */
  id: string

  /**
   * Service type
   */
  type: string

  /**
   * Endpoint URL
   */
  serviceEndpoint: string

  /**
   * Optional. Description
   */
  description?: string
}

/**
 * Identity interface
 * @public
 */
export interface IIdentity {
  /**
   * Decentralized identifier
   */
  did: string

  /**
   * Optional. Identity alias. Can be used to reference an object in an external system
   */
  alias?: string

  /**
   * Identity provider name
   */
  provider: string

  /**
   * Controller key id
   */
  controllerKeyId: string

  /**
   * Array of managed keys
   */
  keys: IKey[]

  /**
   * Array of services
   */
  services: IService[]
}

/**
 * Message meta data
 * @public
 */
export interface IMetaData {
  /**
   * Type
   */
  type: string

  /**
   * Optional. Value
   */
  value?: string
}

/**
 * DIDComm message
 * @public
 */
export interface IMessage {
  /**
   * Unique message ID
   */
  id: string

  /**
   * Message type
   */
  type: string

  /**
   * Optional. Creation date (ISO 8601)
   */
  createdAt?: string

  /**
   * Optional. Expiration date (ISO 8601)
   */
  expiresAt?: string

  /**
   * Optional. Thread ID
   */
  threadId?: string

  /**
   * Optional. Original message raw data
   */
  raw?: string

  /**
   * Optional. Parsed data
   */
  data?: string | object

  /**
   * Optional. List of DIDs to reply to
   */
  replyTo?: string[]

  /**
   * Optional. URL to post a reply message to
   */
  replyUrl?: string

  /**
   * Optional. Sender DID
   */
  from?: string

  /**
   * Optional. Recipient DID
   */
  to?: string

  /**
   * Optional. Array of message metadata
   */
  metaData?: IMetaData[]

  /**
   * Optional. Array of attached verifiable credentials
   */
  credentials?: VerifiableCredential[]

  /**
   * Optional. Array of attached verifiable presentations
   */
  presentations?: VerifiablePresentation[]
}

/**
 * Agent base interface
 * @public
 */
export interface IAgentBase {
  availableMethods: () => string[]
}

/**
 * Agent that can execute methods
 * @public
 */
export interface IAgent extends IAgentBase {
  execute: <A = any, R = any>(method: string, args: A) => Promise<R>
}

/**
 * Agent plugin method interface
 * @public
 */
export interface IPluginMethod {
  (args: any, context: any): Promise<any>
}

/**
 * Plugin method map interface
 * @public
 */
export interface IPluginMethodMap extends Record<string, IPluginMethod> {}

/**
 * Agent plugin interface
 * @public
 */
export interface IAgentPlugin {
  readonly methods: IPluginMethodMap
}

/**
 * Removes context parameter from plugin method interface
 * @public
 */
export interface RemoveContext<T extends IPluginMethod> {
  (args?: Parameters<T>[0] | undefined): ReturnType<T>
}

/**
 * Utility type for constructing agent type that has a list of available methods
 * @public
 */
export type TAgent<T extends IPluginMethodMap> = {
  [P in keyof T]: RemoveContext<T[P]>
} &
  IAgent

/**
 * Standard plugin method context interface
 *
 * @remarks
 * When executing plugin method, you don't need to pass in the context.
 * It is done automatically by the agent
 *
 * @example
 * ```typescript
 * await agent.resolveDid({
 *   didUrl: 'did:example:123'
 * })
 * ```
 * @public
 */
export interface IAgentContext<T extends IPluginMethodMap> {
  /**
   * Configured agent
   */
  agent: TAgent<T>
}

/**
 * Basic data store interface
 * @public
 */
export interface IDataStore extends IPluginMethodMap {
  /**
   * Saves message to the data store
   * @param args - message
   * @returns `true` if successful
   */
  dataStoreSaveMessage(args: IMessage): Promise<boolean>

  /**
   * Saves verifiable credential to the data store
   * @param args - verifiable credential
   * @returns `true` if successful
   */
  dataStoreSaveVerifiableCredential(args: VerifiableCredential): Promise<boolean>

  /**
   * Saves verifiable presentation to the data store
   * @param args - verifiable presentation
   * @returns `true` if successful
   */
  dataStoreSaveVerifiablePresentation(args: VerifiablePresentation): Promise<boolean>
}

/**
 * Input arguments for {@link IResolver.resolveDid | resolveDid}
 * @public
 */
export interface ResolveDidArgs {
  /**
   * DID URL
   *
   * @example
   * `did:web:uport.me`
   */
  didUrl: string
}

/**
 * DID Resolver interface
 * @public
 */
export interface IResolver extends IPluginMethodMap {
  /**
   * Resolves DID and returns DID Document
   *
   * @example
   * ```typescript
   * const doc = await agent.resolveDid({
   *   didUrl: 'did:ethr:rinkeby:0xb09b66026ba5909a7cfe99b76875431d2b8d5190'
   * })
   *
   * expect(doc).toEqual({
   *   '@context': 'https://w3id.org/did/v1',
   *   id: 'did:ethr:rinkeby:0xb09b66026ba5909a7cfe99b76875431d2b8d5190',
   *   publicKey: [
   *     {
   *        id: 'did:ethr:rinkeby:0xb09b66026ba5909a7cfe99b76875431d2b8d5190#owner',
   *        type: 'Secp256k1VerificationKey2018',
   *        owner: 'did:ethr:rinkeby:0xb09b66026ba5909a7cfe99b76875431d2b8d5190',
   *        ethereumAddress: '0xb09b66026ba5909a7cfe99b76875431d2b8d5190'
   *     }
   *   ],
   *   authentication: [
   *     {
   *        type: 'Secp256k1SignatureAuthentication2018',
   *        publicKey: 'did:ethr:rinkeby:0xb09b66026ba5909a7cfe99b76875431d2b8d5190#owner'
   *     }
   *   ]
   * })
   * ```
   *
   * @param args - Input arguments for resolving a DID
   * @public
   */
  resolveDid(args: ResolveDidArgs): Promise<DIDDocument>
}

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

/**
 * Input arguments for {@link IKeyManager.keyManagerCreateKey | keyManagerCreateKey}
 * @public
 */
export interface IKeyManagerCreateKeyArgs {
  /**
   * Key type
   */
  type: TKeyType

  /**
   * Key Management System
   */
  kms: string

  /**
   * Optional. Key meta data
   */
  meta?: object
}

/**
 * Input arguments for {@link IKeyManager.keyManagerGetKey | keyManagerGetKey}
 * @public
 */
export interface IKeyManagerGetKeyArgs {
  /**
   * Key ID
   */
  kid: string
}

/**
 * Input arguments for {@link IKeyManager.keyManagerDeleteKey | keyManagerDeleteKey}
 * @public
 */
export interface IKeyManagerDeleteKeyArgs {
  /**
   * Key ID
   */
  kid: string
}

/**
 * Input arguments for {@link IKeyManager.keyManagerEncryptJWE | keyManagerEncryptJWE}
 * @beta
 */
export interface IKeyManagerEncryptJWEArgs {
  /**
   * Key ID to use for encryption
   */
  kid: string

  /**
   * Recipient key object
   */
  to: Omit<IKey, 'kms'>

  /**
   * Data to encrypt
   */
  data: string
}

/**
 * Input arguments for {@link IKeyManager.keyManagerDecryptJWE | keyManagerDecryptJWE}
 * @beta
 */
export interface IKeyManagerDecryptJWEArgs {
  /**
   * Key ID
   */
  kid: string

  /**
   * Encrypted data
   */
  data: string
}

/**
 * Input arguments for {@link IKeyManager.keyManagerSignJWT | keyManagerSignJWT}
 * @public
 */
export interface IKeyManagerSignJWTArgs {
  /**
   * Key ID
   */
  kid: string

  /**
   * Data to sign
   */
  data: string
}

/**
 * Input arguments for {@link IKeyManager.keyManagerSignEthTX | keyManagerSignEthTX}
 * @public
 */
export interface IKeyManagerSignEthTXArgs {
  /**
   * Key ID
   */
  kid: string

  /**
   * Ethereum transaction object
   */
  transaction: object
}

/**
 * Key manager interface
 * @public
 */
export interface IKeyManager extends IPluginMethodMap {
  /**
   * Lists available key management systems
   */
  keyManagerGetKeyManagementSystems(): Promise<Array<string>>

  /**
   * Creates and returns a new key
   */
  keyManagerCreateKey(args: IKeyManagerCreateKeyArgs): Promise<IKey>

  /**
   * Returns an existing key
   */
  keyManagerGetKey(args: IKeyManagerGetKeyArgs): Promise<IKey>

  /**
   * Deletes a key
   */
  keyManagerDeleteKey(args: IKeyManagerDeleteKeyArgs): Promise<boolean>

  /**
   * Imports a created key
   */
  keyManagerImportKey(args: IKey): Promise<boolean>

  /**
   * Encrypts data
   * @beta
   */
  keyManagerEncryptJWE(args: IKeyManagerEncryptJWEArgs): Promise<string>

  /**
   * Decrypts data
   * @beta
   */
  keyManagerDecryptJWE(args: IKeyManagerDecryptJWEArgs): Promise<string>

  /**
   * Signs JWT
   */
  keyManagerSignJWT(args: IKeyManagerSignJWTArgs): Promise<string>

  /** Signs Ethereum transaction */
  keyManagerSignEthTX(args: IKeyManagerSignEthTXArgs): Promise<string>
}

/**
 * Input arguments for {@link IMessageHandler.handleMessage | handleMessage}
 * @public
 */
export interface IHandleMessageArgs {
  /**
   * Raw message data
   */
  raw: string

  /**
   * Optional. Message meta data
   */
  metaData?: IMetaData[]

  /**
   * Optional. If set to `true`, the message will be saved using {@link IDataStore.dataStoreSaveMessage | dataStoreSaveMessage}
   */
  save?: boolean
}

/**
 * Message handler interface
 * @public
 */
export interface IMessageHandler extends IPluginMethodMap {
  /**
   * Parses and optionally saves a message
   * @param context - Execution context. Requires agent with {@link daf-core#IDataStore} methods
   */
  handleMessage(args: IHandleMessageArgs, context: IAgentContext<IDataStore>): Promise<IMessage>
}
