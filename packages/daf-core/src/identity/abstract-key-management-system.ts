export type KeyType = 'Ed25519' | 'Secp256k1'

export interface SerializedKey {
  type: KeyType
  publicKeyHex: string
  privateKeyHex?: string
  kid: string
  meta?: string
}
// Placeholder:
interface EcdsaSignature {
  r: string
  s: string
  recoveryParam?: number
}
// Placeholder:
type Signer = (data: string) => Promise<EcdsaSignature | string>
type EthSigner = (transaction: object) => string

export abstract class AbstractKey {
  abstract serialized: SerializedKey
  abstract encrypt(to: SerializedKey, data: string): Promise<string>
  abstract decrypt(encrypted: string): Promise<string>
  abstract signer(): Signer
  signEthTransaction(transaction: object, callback: (error: string | null, signature: string) => void) {
    throw Error('Method signTransaction not implemented')
  }
}

export abstract class AbstractKeyManagementSystem {
  abstract createKey(type: KeyType): Promise<AbstractKey>
  abstract getKey(kid: string): Promise<AbstractKey>
  abstract deleteKey(kid: string): Promise<boolean>
  importKey(key: SerializedKey): Promise<AbstractKey> {
    return Promise.reject('Method importKey not implemented')
  }
}
