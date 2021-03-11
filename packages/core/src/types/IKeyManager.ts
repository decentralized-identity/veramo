import { IPluginMethodMap } from './IAgent'
import { TKeyType, IKey } from './IIdentifier'

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
  meta?: object
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
  keyManagerCreate(args: IKeyManagerCreateArgs): Promise<IKey>

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
  keyManagerImport(args: IKey): Promise<boolean>

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
