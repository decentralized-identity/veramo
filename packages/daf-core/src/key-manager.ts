import { AbstractKeyStore } from './abstract/abstract-key-store'
import { AbstractKeyManagementSystem } from './abstract/abstract-key-management-system'
import { IKey, TKeyType, IAgentPlugin, IPluginMethodMap } from './types'

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
  meta?: Record<string, any>
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
 * Agent plugin that provides {@link IKeyManager} methods
 * @public
 */
export class KeyManager implements IAgentPlugin {
  /**
   * Plugin methods
   * @public
   */
  readonly methods: IKeyManager

  private store: AbstractKeyStore
  private kms: Record<string, AbstractKeyManagementSystem>

  constructor(options: { store: AbstractKeyStore; kms: Record<string, AbstractKeyManagementSystem> }) {
    this.store = options.store
    this.kms = options.kms
    this.methods = {
      keyManagerCreateKey: this.keyManagerCreateKey.bind(this),
      keyManagerGetKey: this.keyManagerGetKey.bind(this),
      keyManagerDeleteKey: this.keyManagerDeleteKey.bind(this),
      keyManagerImportKey: this.keyManagerImportKey.bind(this),
      keyManagerEncryptJWE: this.keyManagerDecryptJWE.bind(this),
      keyManagerDecryptJWE: this.keyManagerDecryptJWE.bind(this),
      keyManagerSignJWT: this.keyManagerSignJWT.bind(this),
      keyManagerSignEthTX: this.keyManagerSignEthTX.bind(this),
    }
  }

  private getKms(name: string): AbstractKeyManagementSystem {
    const kms = this.kms[name]
    if (!kms) throw Error('KMS does not exist: ' + name)
    return kms
  }

  /** {@inheritDoc IKeyManager.keyManagerCreateKey} */
  async keyManagerCreateKey(args: IKeyManagerCreateKeyArgs): Promise<IKey> {
    const kms = this.getKms(args.kms)
    const partialKey = await kms.createKey({ type: args.type, meta: args.meta })
    const key: IKey = { ...partialKey, kms: args.kms }
    await this.store.import(key)
    if (key.privateKeyHex) {
      delete key.privateKeyHex
    }
    return key
  }

  /** {@inheritDoc IKeyManager.keyManagerGetKey} */
  async keyManagerGetKey({ kid }: IKeyManagerGetKeyArgs): Promise<IKey> {
    return this.store.get({ kid })
  }

  /** {@inheritDoc IKeyManager.keyManagerDeleteKey} */
  async keyManagerDeleteKey({ kid }: IKeyManagerDeleteKeyArgs): Promise<boolean> {
    const key = await this.store.get({ kid })
    const kms = this.getKms(key.kms)
    await kms.deleteKey({ kid })
    return this.store.delete({ kid })
  }

  /** {@inheritDoc IKeyManager.keyManagerImportKey} */
  async keyManagerImportKey(key: IKey): Promise<boolean> {
    return this.store.import(key)
  }

  /** {@inheritDoc IKeyManager.keyManagerEncryptJWE} */
  async keyManagerEncryptJWE({ kid, to, data }: IKeyManagerEncryptJWEArgs): Promise<string> {
    const key = await this.store.get({ kid })
    const kms = this.getKms(key.kms)
    return kms.encryptJWE({ key, to, data })
  }

  /** {@inheritDoc IKeyManager.keyManagerDecryptJWE} */
  async keyManagerDecryptJWE({ kid, data }: IKeyManagerDecryptJWEArgs): Promise<string> {
    const key = await this.store.get({ kid })
    const kms = this.getKms(key.kms)
    return kms.decryptJWE({ key, data })
  }

  /** {@inheritDoc IKeyManager.keyManagerSignJWT} */
  async keyManagerSignJWT({ kid, data }: IKeyManagerSignJWTArgs): Promise<string> {
    const key = await this.store.get({ kid })
    const kms = this.getKms(key.kms)
    return kms.signJWT({ key, data })
  }

  /** {@inheritDoc IKeyManager.keyManagerSignEthTX} */
  async keyManagerSignEthTX({ kid, transaction }: IKeyManagerSignEthTXArgs): Promise<string> {
    const key = await this.store.get({ kid })
    const kms = this.getKms(key.kms)
    return kms.signEthTX({ key, transaction })
  }
}
