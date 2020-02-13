import { AbstractKeyManagementSystem, KeyType, AbstractKey, SerializedKey } from 'daf-core'
import * as sodium from 'libsodium-wrappers'

export class Key extends AbstractKey {
  async encrypt(to: SerializedKey, data: string) {
    return ''
  }

  async decrypt(data: string) {
    return ''
  }

  async sign(data: string) {
    return ''
  }
}
export class KeyManagementSystem extends AbstractKeyManagementSystem {
  private fileName: string

  constructor(options: { fileName: string }) {
    super()
    this.fileName = options.fileName
  }

  async createKey(type: KeyType) {
    let serializedKey: SerializedKey

    switch (type) {
      case 'Ed25519':
        await sodium.ready
        const keyPair = sodium.crypto_sign_keypair()
        serializedKey = {
          type,
          kid: Buffer.from(keyPair.publicKey).toString('hex'),
          publicKeyHex: Buffer.from(keyPair.publicKey).toString('hex'),
          privateKeyHex: Buffer.from(keyPair.privateKey).toString('hex'),
        }

        break
    }
  }
}
