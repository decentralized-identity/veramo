import { MinimalImportableKey } from './IKeyManager.js'

/**
 * Identifier interface
 * @public
 */
export interface IIdentifier {
  /**
   * Decentralized identifier
   */
  did: string

  /**
   * Optional. Identifier alias. Can be used to reference an object in an external system
   */
  alias?: string

  /**
   * Identifier provider name
   */
  provider: string

  /**
   * Controller key id
   */
  controllerKeyId?: string

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
 * Represents the minimum amount of information needed to import an {@link IIdentifier}.
 *
 * @public
 */
export type MinimalImportableIdentifier = {
  keys: Array<MinimalImportableKey>
  services?: Array<IService>
} & Omit<IIdentifier, 'keys' | 'services'>

/**
 * Cryptographic key type.
 *
 * @public
 */
export type TKeyType = 'Ed25519' | 'Secp256k1' | 'Secp256r1' | 'X25519' | 'Bls12381G1' | 'Bls12381G2'

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
   * Optional. Key metadata. This should be used to determine which algorithms are supported.
   */
  meta?: KeyMetadata | null
}

/**
 * This encapsulates data about a key.
 *
 * Implementations of {@link @veramo/key-manager#AbstractKeyManagementSystem | AbstractKeyManagementSystem} should
 * populate this object, for each key, with the algorithms that can be performed using it.
 *
 * This can also be used to add various tags to the keys under management.
 *
 * @public
 */
export interface KeyMetadata {
  algorithms?: string[]

  [x: string]: any
}

/**
 * Identifier service
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
  serviceEndpoint: IServiceEndpoint | IServiceEndpoint[]

  /**
   * Optional. Description
   */
  description?: string
}

/**
 * Represents a service endpoint URL or a map of URLs
 * @see {@link https://www.w3.org/TR/did-core/#dfn-serviceendpoint | serviceEndpoint data model}
 *
 * @public
 */
export type IServiceEndpoint = string | Record<string, any>
