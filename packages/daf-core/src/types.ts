import { DIDDocument } from 'did-resolver'
import { Verifiable, W3CCredential, W3CPresentation } from 'did-jwt-vc'
export { W3CCredential, W3CPresentation }

/**
 * Verifiable Credential {@link decentralized-identity/did-jwt-vc#Verifiable<W3CCredential>}
 * @public
 */
export type VerifiableCredential = Verifiable<W3CCredential>

/**
 * Verifiable Presentation {@link decentralized-identity/did-jwt-vc#Verifiable<W3CPresentation>}
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
  meta?: Record<string, any>
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
  data?: any

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
 *
 * @example
 * ```typescript
 * import { createAgent, TAgent, IResolveDid, IHandleMessage } from 'daf-core'
 * const agent = createAgent<TAgent<IResolveDid & IHandleMessage & IW3c>>(...)
 * ```
 * @public
 */
export type TAgent<T extends IPluginMethodMap> = {
  [P in keyof T]: RemoveContext<T[P]>
} &
  Pick<IAgentBase, 'availableMethods'>

/**
 * Standard plugin method context interface
 * @public
 */
export interface IAgentContext<T extends IPluginMethodMap> {
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
 * Input arguments for {@link IResolveDid.resolveDid | resolveDid}
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
export interface IResolveDid extends IPluginMethodMap {
  /**
   * Resolves DID and returns DID Document
   *
   * @example
   * ```typescript
   * const doc = await agent.resolveDid({
   *   didUrl: 'did:web:uport.me'
   * })
   * ```
   *
   * @param args - Input arguments for resolving a DID
   * @public
   */
  resolveDid(args: ResolveDidArgs): Promise<DIDDocument>
}
