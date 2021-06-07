import { TKeyType, IKey } from '@veramo/core'
import { AbstractKeyManagementSystem } from '@veramo/key-manager'
import {
  createAnonDecrypter,
  createAnonEncrypter,
  createJWE,
  decryptJWE,
  EdDSASigner,
  ES256KSigner,
  JWE,
} from 'did-jwt'
import { generateKeyPair, convertPublicKeyToX25519, convertSecretKeyToX25519 } from '@stablelib/ed25519'
import { generateKeyPair as generateEncryptionKeypair } from '@stablelib/x25519'
import { TypedDataDomain, TypedDataField } from '@ethersproject/abstract-signer'
import { TransactionRequest } from '@ethersproject/abstract-provider'
import { toUtf8Bytes, toUtf8String } from '@ethersproject/strings'
import { parse } from '@ethersproject/transactions'
import { Wallet } from '@ethersproject/wallet'
import { SigningKey } from '@ethersproject/signing-key'
import { randomBytes } from "@ethersproject/random";
import Debug from 'debug'
import { arrayify } from '@ethersproject/bytes'
const debug = Debug('veramo:kms:local')

export class KeyManagementSystem extends AbstractKeyManagementSystem {
  async createKey({ type }: { type: TKeyType }): Promise<Omit<IKey, 'kms'>> {
    let key: Omit<IKey, 'kms'>

    switch (type) {
      case 'Ed25519': {
        const keyPairEd25519 = generateKeyPair()
        key = {
          type,
          kid: Buffer.from(keyPairEd25519.publicKey).toString('hex'),
          publicKeyHex: Buffer.from(keyPairEd25519.publicKey).toString('hex'),
          privateKeyHex: Buffer.from(keyPairEd25519.secretKey).toString('hex'),
          meta: {
            algorithms: ['Ed25519', 'EdDSA'],
          },
        }
        break
      }
      case 'Secp256k1': {
        const privateBytes = randomBytes(32)
        const keyPair = new SigningKey(privateBytes)
        const publicKeyHex = keyPair.publicKey.substring(2)
        const privateKeyHex = keyPair.privateKey.substring(2)
        key = {
          type,
          kid: publicKeyHex,
          publicKeyHex,
          privateKeyHex,
          meta: {
            algorithms: ['ES256K', 'ES256K-R', 'eth_signTransaction', 'eth_signTypedData', 'eth_signMessage'],
          },
        }
        break
      }
      case 'X25519': {
        const keyPairX25519 = generateEncryptionKeypair()
        key = {
          type,
          kid: Buffer.from(keyPairX25519.publicKey).toString('hex'),
          publicKeyHex: Buffer.from(keyPairX25519.publicKey).toString('hex'),
          privateKeyHex: Buffer.from(keyPairX25519.secretKey).toString('hex'),
          meta: {
            algorithms: ['ECDH', 'ECDH-ES', 'ECDH-1PU'],
          },
        }
        break
      }
      default:
        throw Error('not_supported: Key type not supported: ' + type)
    }

    debug('Created key', type, key.publicKeyHex)

    return key
  }

  async deleteKey(args: { kid: string }) {
    // this kms doesn't need to delete keys
    return true
  }

  async encryptJWE({ key, to, data }: { key: IKey; to: IKey; data: string }): Promise<string> {
    let recipientPublicKey: Uint8Array
    if (to.type === 'Ed25519') {
      recipientPublicKey = arrayify('0x' + to.publicKeyHex)
      recipientPublicKey = convertPublicKeyToX25519(recipientPublicKey)
    } else if (to.type === 'X25519') {
      recipientPublicKey = arrayify('0x' + to.publicKeyHex)
    } else {
      throw new Error('not_supported: The recipient public key type is not supported')
    }

    const dataBytes = toUtf8Bytes(data)
    const encrypter = createAnonEncrypter(recipientPublicKey)
    const result: JWE = await createJWE(dataBytes, [encrypter])

    return JSON.stringify(result)
  }

  async decryptJWE({ key, data }: { key: IKey; data: string }): Promise<string> {
    if (!key.privateKeyHex) throw Error('No private key')

    let secretKey: Uint8Array
    if (key.type === 'Ed25519') {
      secretKey = arrayify('0x' + key.privateKeyHex)
      secretKey = convertSecretKeyToX25519(secretKey)
    } else if (key.type === 'X25519') {
      secretKey = arrayify('0x' + key.privateKeyHex)
    } else {
      throw new Error('not_supported: The recipient public key type is not supported')
    }

    const jwe: JWE = JSON.parse(data)
    const decrypter = createAnonDecrypter(secretKey)

    const decrypted = await decryptJWE(jwe, decrypter)
    const result = toUtf8String(decrypted)
    return result
  }

  async sign({ key, algorithm, data }: { key: IKey; algorithm?: string; data: Uint8Array }): Promise<string> {
    //FIXME: KMS implementation should not rely on private keys being provided, but rather manage their own keys
    if (!key.privateKeyHex) throw Error('No private key for kid: ' + key.kid)

    if (
      key.type === 'Ed25519' &&
      (typeof algorithm === 'undefined' || ['Ed25519', 'EdDSA'].includes(algorithm))
    ) {
      return await this.signEdDSA(key.privateKeyHex, data)
    } else if (key.type === 'Secp256k1') {
      if (typeof algorithm === 'undefined' || ['ES256K', 'ES256K-R'].includes(algorithm)) {
        return await this.signES256K(key.privateKeyHex, algorithm, data)
      } else if (['eth_signTransaction', 'signTransaction', 'signTx'].includes(algorithm)) {
        return await this.eth_signTransaction(key.privateKeyHex, data)
      } else if (algorithm === 'eth_signMessage') {
        return await this.eth_signMessage(key.privateKeyHex, data)
      } else if (['eth_signTypedData', 'EthereumEip712Signature2021'].includes(algorithm)) {
        return await this.eth_signTypedData(key.privateKeyHex, data)
      }
    }
    throw Error(`not_supported: Cannot sign ${algorithm} using key of type ${key.type}`)
  }

  /**
   * @returns a `0x` prefixed hex string representing the signed EIP712 data
   */
  private async eth_signTypedData(privateKeyHex: string, data: Uint8Array) {
    let msg, msgDomain, msgTypes
    const serializedData = toUtf8String(data)
    try {
      let jsonData = <Eip712Payload>JSON.parse(serializedData)
      if (typeof jsonData.domain === 'object' && typeof jsonData.types === 'object') {
        const { domain, types, message } = jsonData
        msg = message
        msgDomain = domain
        msgTypes = types
      } else {
        // next check will throw since the data couldn't be parsed
      }
    } catch (e) {
      // next check will throw since the data couldn't be parsed
    }
    if (typeof msgDomain !== 'object' || typeof msgTypes !== 'object' || typeof msg !== 'object') {
      throw Error(
        `invalid_arguments: Cannot sign typed data. 'domain', 'types', and 'message' must be provided`,
      )
    }
    const wallet = new Wallet(privateKeyHex)

    const signature = await wallet._signTypedData(msgDomain, msgTypes, msg)
    //HEX encoded string
    return signature
  }

  /**
   * @returns a `0x` prefixed hex string representing the signed message
   */
  private async eth_signMessage(privateKeyHex: string, rawMessageBytes: Uint8Array) {
    const wallet = new Wallet(privateKeyHex)
    const signature = await wallet.signMessage(rawMessageBytes)
    //HEX encoded string, 0x prefixed
    return signature
  }

  /**
   * @returns a `0x` prefixed hex string representing the signed raw transaction
   */
  private async eth_signTransaction(privateKeyHex: string, rlpTransaction: Uint8Array) {
    const { v, r, s, type, ...tx } = parse(rlpTransaction)
    const wallet = new Wallet(privateKeyHex)
    const signedRawTransaction = await wallet.signTransaction(<TransactionRequest>tx)
    //HEX encoded string, 0x prefixed
    return signedRawTransaction
  }

  /**
   * @returns a base64url encoded signature for the `EdDSA` alg
   */
  private async signEdDSA(key: string, data: Uint8Array): Promise<string> {
    const signer = EdDSASigner(key)
    const signature = await signer(data)
    //base64url encoded string
    return signature as string
  }

  /**
   * @returns a base64url encoded signature for the `ES256K` or `ES256K-R` alg
   */
  private async signES256K(
    privateKeyHex: string,
    alg: string | undefined,
    data: Uint8Array,
  ): Promise<string> {
    const signer = ES256KSigner(privateKeyHex, alg === 'ES256K-R')
    const signature = await signer(data)
    //base64url encoded string
    return signature as string
  }
}

type Eip712Payload = {
  domain: TypedDataDomain
  types: Record<string, TypedDataField[]>
  primaryType: string
  message: Record<string, any>
}
