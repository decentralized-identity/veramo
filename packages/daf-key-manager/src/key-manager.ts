import { AbstractKeyStore } from './abstract-key-store'
import { AbstractKeyManagementSystem } from './abstract-key-management-system'
import {
  IKey,
  IKeyManager,
  IAgentPlugin,
  IKeyManagerCreateKeyArgs,
  IKeyManagerGetKeyArgs,
  IKeyManagerDeleteKeyArgs,
  IKeyManagerEncryptJWEArgs,
  IKeyManagerDecryptJWEArgs,
  IKeyManagerSignJWTArgs,
  IKeyManagerSignEthTXArgs,
} from 'daf-core'

/**
 * Agent plugin that provides {@link daf-core#IKeyManager} methods
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
      keyManagerGetKeyManagementSystems: this.keyManagerGetKeyManagementSystems.bind(this),
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

  /** {@inheritDoc daf-core#IKeyManager.keyManagerGetKeyManagementSystems} */
  async keyManagerGetKeyManagementSystems(): Promise<Array<string>> {
    return Object.keys(this.kms)
  }

  /** {@inheritDoc daf-core#IKeyManager.keyManagerCreateKey} */
  async keyManagerCreateKey(args: IKeyManagerCreateKeyArgs): Promise<IKey> {
    const kms = this.getKms(args.kms)
    const partialKey = await kms.createKey({ type: args.type, meta: args.meta })
    const key: IKey = { ...partialKey, kms: args.kms, meta: args.meta }
    await this.store.import(key)
    if (key.privateKeyHex) {
      delete key.privateKeyHex
    }
    return key
  }

  /** {@inheritDoc daf-core#IKeyManager.keyManagerGetKey} */
  async keyManagerGetKey({ kid }: IKeyManagerGetKeyArgs): Promise<IKey> {
    return this.store.get({ kid })
  }

  /** {@inheritDoc daf-core#IKeyManager.keyManagerDeleteKey} */
  async keyManagerDeleteKey({ kid }: IKeyManagerDeleteKeyArgs): Promise<boolean> {
    const key = await this.store.get({ kid })
    const kms = this.getKms(key.kms)
    await kms.deleteKey({ kid })
    return this.store.delete({ kid })
  }

  /** {@inheritDoc daf-core#IKeyManager.keyManagerImportKey} */
  async keyManagerImportKey(key: IKey): Promise<boolean> {
    return this.store.import(key)
  }

  /** {@inheritDoc daf-core#IKeyManager.keyManagerEncryptJWE} */
  async keyManagerEncryptJWE({ kid, to, data }: IKeyManagerEncryptJWEArgs): Promise<string> {
    const key = await this.store.get({ kid })
    const kms = this.getKms(key.kms)
    return kms.encryptJWE({ key, to, data })
  }

  /** {@inheritDoc daf-core#IKeyManager.keyManagerDecryptJWE} */
  async keyManagerDecryptJWE({ kid, data }: IKeyManagerDecryptJWEArgs): Promise<string> {
    const key = await this.store.get({ kid })
    const kms = this.getKms(key.kms)
    return kms.decryptJWE({ key, data })
  }

  /** {@inheritDoc daf-core#IKeyManager.keyManagerSignJWT} */
  async keyManagerSignJWT({ kid, data }: IKeyManagerSignJWTArgs): Promise<string> {
    const key = await this.store.get({ kid })
    const kms = this.getKms(key.kms)
    return kms.signJWT({ key, data })
  }

  /** {@inheritDoc daf-core#IKeyManager.keyManagerSignEthTX} */
  async keyManagerSignEthTX({ kid, transaction }: IKeyManagerSignEthTXArgs): Promise<string> {
    const key = await this.store.get({ kid })
    const kms = this.getKms(key.kms)
    return kms.signEthTX({ key, transaction })
  }
}
