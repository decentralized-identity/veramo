export type KeyType = 'curve25519' | 'ed25519' | 'x25519'

export interface KeyPair {
  keyType: KeyType
  privateKey: Uint8Array
  privateKeyHex: string
  publicKey: Uint8Array
  publicKeyHex: string
}

export interface EncryptionKeyManager {
  getKeyPairForDid(did: string): Promise<KeyPair | null>
  getKeyPairForPublicKey(publicKey: Uint8Array): Promise<KeyPair | null>
  createKeyPairForDid(did: string): Promise<KeyPair>
  listKeyPairs(): Promise<KeyPair[]>
}
