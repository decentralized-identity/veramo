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
 * Known algorithms supported by some of the above key types defined by {@link TKeyType}.
 *
 * Actual implementations of {@link @veramo/key-manager#AbstractKeyManagementSystem | Key Management Systems} can
 * support more. One should check the {@link IKey.meta | IKey.meta.algorithms} property to see what is possible for a
 * particular managed key.
 *
 * @public
 */
export type TAlg = 'ES256K' | 'ES256K-R' | 'ES256' | 'EdDSA' | 'ECDH' | 'ECDH-ES' | 'ECDH-1PU' | string

/**
 * Mapping of known key types({@link TKeyType}) to the known algorithms({@link TAlg}) they should support.
 *
 * @public
 */
export const KEY_ALG_MAPPING: Record<TKeyType, ReadonlyArray<TAlg>> = {
  Secp256k1: ['ES256K', 'ES256K-R'],
  Secp256r1: ['ES256', 'ECDH', 'ECDH-ES', 'ECDH-1PU'],
  Ed25519: ['EdDSA'],
  X25519: ['ECDH', 'ECDH-ES', 'ECDH-1PU'],
  Bls12381G1: [],
  Bls12381G2: [],
} as const

/**
 * Cryptographic key, usually managed by the current Veramo instance.
 *
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
  algorithms?: TAlg[]

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
