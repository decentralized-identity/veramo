import { AbstractSecretBox } from 'daf-core'
import sodium from 'react-native-sodium'

export class SecretBox extends AbstractSecretBox {
  constructor(private secretKey: string) {
    super()
    if (!secretKey) {
      throw Error('Secret key is required')
    }
  }

  static async createSecretKey(): Promise<string> {
    await sodium.ready
    const boxKeyPair = sodium.crypto_box_keypair()
    const secretKey = sodium.to_hex(boxKeyPair.privateKey)
    return secretKey
  }

  async encrypt(message: string): Promise<string> {
    await sodium.ready
    const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES)
    const cipherText = sodium.crypto_secretbox_easy(message, nonce, sodium.from_hex(this.secretKey))
    return sodium.to_hex(new Uint8Array([...nonce, ...cipherText]))
  }

  async decrypt(encryptedMessageHex: string): Promise<string> {
    await sodium.ready
    const cipherTextWithNonce = sodium.from_hex(encryptedMessageHex)
    const nonce = cipherTextWithNonce.slice(0, sodium.crypto_secretbox_NONCEBYTES)
    const cipherText = cipherTextWithNonce.slice(sodium.crypto_secretbox_NONCEBYTES)
    return sodium.to_string(
      sodium.crypto_secretbox_open_easy(cipherText, nonce, sodium.from_hex(this.secretKey)),
    )
  }
}
