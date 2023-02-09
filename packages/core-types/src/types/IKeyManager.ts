import { IPluginMethodMap } from './IAgent.js'
import { TKeyType, IKey, KeyMetadata } from './IIdentifier.js'

/**
 * Represents an object type where a subset of keys are required and everything else is optional.
 *
 * @public
 */
export type RequireOnly<T, K extends keyof T> = Required<Pick<T, K>> & Partial<T>

/**
 * Represents the properties required to import a key.
 *
 * @public
 */
export type MinimalImportableKey = RequireOnly<IKey, 'privateKeyHex' | 'type' | 'kms'>

/**
 * Represents information about a managed key.
 * Private or secret key material is NOT present.
 *
 * @public
 */
export type ManagedKeyInfo = Omit<IKey, 'privateKeyHex'>

/**
 * Input arguments for {@link IKeyManager.keyManagerCreate | keyManagerCreate}
 * @public
 */
export interface IKeyManagerCreateArgs {
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
  meta?: KeyMetadata
}

/**
 * Input arguments for {@link IKeyManager.keyManagerGet | keyManagerGet}
 * @public
 */
export interface IKeyManagerGetArgs {
  /**
   * Key ID
   */
  kid: string
}

/**
 * Input arguments for {@link IKeyManager.keyManagerDelete | keyManagerDelete}
 * @public
 */
export interface IKeyManagerDeleteArgs {
  /**
   * Key ID
   */
  kid: string
}

/**
 * Input arguments for {@link IKeyManager.keyManagerEncryptJWE | keyManagerEncryptJWE}
 * @beta This API may change without a BREAKING CHANGE notice.
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
 * @beta This API may change without a BREAKING CHANGE notice.
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
 * Input arguments for {@link IKeyManager.keyManagerSign | keyManagerSign}
 * @public
 */
export interface IKeyManagerSignArgs {
  /**
   * The key handle, as returned during `keyManagerCreateKey`
   */
  keyRef: string

  /**
   * The algorithm to use for signing.
   * This must be one of the algorithms supported by the KMS for this key type.
   *
   * The algorithm used here should match one of the names listed in `IKey.meta.algorithms`
   */
  algorithm?: string

  /**
   * Data to sign
   */
  data: string

  /**
   * If the data is a "string" then you can specify which encoding is used. Default is "utf-8"
   */
  encoding?: 'utf-8' | 'base16' | 'base64' | 'hex'

  [x: string]: any
}

/**
 * Input arguments for {@link IKeyManager.keyManagerSharedSecret | keyManagerSharedSecret}
 * @public
 */
export interface IKeyManagerSharedSecretArgs {
  /**
   * The secret key handle (`kid`)
   * as returned by {@link IKeyManager.keyManagerCreate | keyManagerCreate}
   */
  secretKeyRef: string

  /**
   * The public key of the other party.
   * The `type` of key MUST be compatible with the type referenced by `secretKeyRef`
   */
  publicKey: Pick<IKey, 'publicKeyHex' | 'type'>
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
  data: string | Uint8Array
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
 * Key manager interface.
 *
 * This defines an interface for a plugin that orchestrates various implementations of
 * {@link @veramo/key-manager#AbstractKeyManagementSystem | AbstractKeyManagementSystem}.
 *
 * See {@link @veramo/key-manager#KeyManager | KeyManager} for a reference implementation.
 *
 * The methods of this plugin are used automatically by other plugins, such as
 * {@link @veramo/did-manager#DIDManager | DIDManager},
 * {@link @veramo/credential-w3c#CredentialPlugin | CredentialPlugin}, or {@link @veramo/did-comm#DIDComm | DIDComm} to
 * perform their required cryptographic operations using the managed keys.
 *
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
  keyManagerCreate(args: IKeyManagerCreateArgs): Promise<ManagedKeyInfo>

  /**
   * Returns an existing key
   */
  keyManagerGet(args: IKeyManagerGetArgs): Promise<IKey>

  /**
   * Deletes a key
   */
  keyManagerDelete(args: IKeyManagerDeleteArgs): Promise<boolean>

  /**
   * Imports a created key
   */
  keyManagerImport(args: MinimalImportableKey): Promise<ManagedKeyInfo>

  /**
   * Generates a signature according to the algorithm specified.
   * @throws `Error("not_supported")` if the KMS does not support the operation or if the key does not match the
   *   algorithm.
   * @param args - The input to the signing method, including data to be signed, key reference and algorithm to use.
   */
  keyManagerSign(args: IKeyManagerSignArgs): Promise<string>

  /**
   * Compute a shared secret with the public key of another party.
   *
   * This computes the raw shared secret (the result of a Diffie-Hellman computation)
   * To use this for symmetric encryption you MUST apply a KDF on the result.
   *
   * @param args - The input to compute the shared secret, including the local key reference and remote key details.
   * @returns a `Promise` that resolves to a hex encoded shared secret
   */
  keyManagerSharedSecret(args: IKeyManagerSharedSecretArgs): Promise<string>

  /**
   * Encrypts data
   * @beta This API may change without a BREAKING CHANGE notice.
   */
  keyManagerEncryptJWE(args: IKeyManagerEncryptJWEArgs): Promise<string>

  /**
   * Decrypts data
   * @beta This API may change without a BREAKING CHANGE notice.
   */
  keyManagerDecryptJWE(args: IKeyManagerDecryptJWEArgs): Promise<string>

  /**
   * Signs JWT
   */
  keyManagerSignJWT(args: IKeyManagerSignJWTArgs): Promise<string>

  /** Signs Ethereum transaction */
  keyManagerSignEthTX(args: IKeyManagerSignEthTXArgs): Promise<string>
}
