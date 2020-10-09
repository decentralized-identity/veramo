import { IPluginMethodMap } from './IAgent'
import { TKeyType, IKey } from './IIdentity'

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

export interface EcdsaSignature {
  r: string
  s: string
  recoveryParam: 1
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
  keyManagerSignJWT(args: IKeyManagerSignJWTArgs): Promise<EcdsaSignature>

  /** Signs Ethereum transaction */
  keyManagerSignEthTX(args: IKeyManagerSignEthTXArgs): Promise<string>
}
