import { AbstractSecretBox } from '@veramo/key-manager'
import { secretBox, openSecretBox, generateKeyPair } from '@stablelib/nacl'
import { randomBytes } from '@stablelib/random'
import { getBytes, concat, hexlify, toUtf8Bytes, toUtf8String } from 'ethers'

const NONCE_BYTES = 24

/**
 * This is an implementation of {@link @veramo/key-manager#AbstractSecretBox | AbstractSecretBox} that uses a JavaScript
 * {@link https://nacl.cr.yp.to/secretbox.html | nacl secretBox} implementation for encryption.
 *
 * See {@link @veramo/data-store#PrivateKeyStore}
 * See {@link @veramo/data-store-json#PrivateKeyStoreJson}
 * See {@link @veramo/key-manager#AbstractSecretBox}
 *
 * @public
 */
export class SecretBox extends AbstractSecretBox {
  constructor(private secretKey: string) {
    super()
    if (!secretKey) {
      throw Error('Secret key is required')
    }
  }

  static async createSecretKey(): Promise<string> {
    const pair = generateKeyPair()
    return hexlify(pair.secretKey).substring(2)
  }

  async encrypt(message: string): Promise<string> {
    const nonce = randomBytes(NONCE_BYTES)
    const key = getBytes('0x' + this.secretKey)
    const cipherText = secretBox(key, nonce, toUtf8Bytes(message))
    return concat([nonce, cipherText]).substring(2)
  }

  async decrypt(encryptedMessageHex: string): Promise<string> {
    const cipherTextWithNonce = getBytes('0x' + encryptedMessageHex)
    const nonce = cipherTextWithNonce.slice(0, NONCE_BYTES)
    const cipherText = cipherTextWithNonce.slice(NONCE_BYTES)
    const key = getBytes('0x' + this.secretKey)
    const decrypted = openSecretBox(key, nonce, cipherText) || new Uint8Array(0)
    return toUtf8String(decrypted)
  }
}
