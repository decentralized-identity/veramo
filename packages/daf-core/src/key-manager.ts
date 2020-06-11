import { AbstractKeyStore } from './abstract/abstract-key-store'
import { AbstractKeyManagementSystem } from './abstract/abstract-key-management-system'
import { IAgentPlugin } from './types'
import { IKey, EcdsaSignature } from './types'

export interface IAgentKeyManager {
  keyManagerCreateKey?: (args: { type: KeyType; kms: string; meta?: Record<string, any> }) => Promise<IKey>
  keyManagerGetKey?: (args: { kid: string }) => Promise<IKey>
  keyManagerDeleteKey?: (args: { kid: string }) => Promise<boolean>
  keyManagerImportKey?: (args: IKey) => Promise<boolean>
  keyManagerEncryptJWE?: (args: { kid: string; to: string; data: string }) => Promise<string>
  keyManagerDecryptJWE?: (args: { kid: string; data: string }) => Promise<string>
  keyManagerSignJWT?: (args: { kid: string; data: string }) => Promise<EcdsaSignature | string>
  keyManagerSignEthTX?: (args: { kid: string; data: string }) => Promise<string>
}
export class KeyManager implements IAgentPlugin {
  readonly methods: Required<IAgentKeyManager>
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
      keyManagerSignEthTX: this.keyManagerSignJWT.bind(this),
    }
  }

  private getKms(name: string): AbstractKeyManagementSystem {
    const kms = this.kms[name]
    if (!kms) throw Error('KMS does not exist: ' + name)
    return kms
  }

  async keyManagerCreateKey(args: { type: KeyType; kms: string; meta?: Record<string, any> }): Promise<IKey> {
    const kms = this.getKms(args.kms)
    const key = await kms.createKey({ type: args.type, meta: args.meta })
    await this.store.import(key)
    return key
  }

  async keyManagerGetKey({ kid }: { kid: string }): Promise<IKey> {
    return this.store.get({ kid })
  }

  async keyManagerDeleteKey({ kid }: { kid: string }): Promise<boolean> {
    const key = await this.store.get({ kid })
    const kms = this.getKms(key.kms)
    await kms.deleteKey({ kid })
    return this.store.delete({ kid })
  }

  async keyManagerImportKey(key: IKey): Promise<boolean> {
    return this.store.import(key)
  }

  async keyManagerEncryptJWE({ kid, to, data }: { kid: string; to: string; data: string }): Promise<string> {
    const key = await this.store.get({ kid })
    const kms = this.getKms(key.kms)
    return kms.encryptJWE({ key, to, data })
  }

  async keyManagerDecryptJWE({ kid, data }: { kid: string; data: string }): Promise<string> {
    const key = await this.store.get({ kid })
    const kms = this.getKms(key.kms)
    return kms.decryptJWE({ key, data })
  }

  async keyManagerSignJWT({ kid, data }: { kid: string; data: string }): Promise<EcdsaSignature | string> {
    const key = await this.store.get({ kid })
    const kms = this.getKms(key.kms)
    return kms.signJWT({ key, data })
  }

  async keyManagerSignEthTX({ kid, data }: { kid: string; data: string }): Promise<string> {
    const key = await this.store.get({ kid })
    const kms = this.getKms(key.kms)
    return kms.signEthTX({ key, data })
  }
}
