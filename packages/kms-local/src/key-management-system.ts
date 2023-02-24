import { TKeyType, IKey, ManagedKeyInfo, MinimalImportableKey, RequireOnly } from '@veramo/core-types'
import { AbstractKeyManagementSystem, AbstractPrivateKeyStore, Eip712Payload } from '@veramo/key-manager'
import { ManagedPrivateKey } from '@veramo/key-manager'

import { EdDSASigner, ES256KSigner, ES256Signer } from 'did-jwt'
import {
  generateKeyPair as generateSigningKeyPair,
  convertPublicKeyToX25519,
  convertSecretKeyToX25519,
  extractPublicKeyFromSecretKey,
} from '@stablelib/ed25519'
import {
  generateKeyPair as generateEncryptionKeypair,
  generateKeyPairFromSeed as generateEncryptionKeyPairFromSeed,
  sharedKey,
} from '@stablelib/x25519'
import { TransactionRequest } from '@ethersproject/abstract-provider'
import { toUtf8String } from '@ethersproject/strings'
import { parse } from '@ethersproject/transactions'
import { Wallet } from '@ethersproject/wallet'
import { SigningKey } from '@ethersproject/signing-key'
import { randomBytes } from '@ethersproject/random'
import { arrayify, hexlify } from '@ethersproject/bytes'
import * as u8a from 'uint8arrays'
import Debug from 'debug'
import elliptic from 'elliptic'

const debug = Debug('veramo:kms:local')

/**
 * This is an implementation of {@link @veramo/key-manager#AbstractKeyManagementSystem | AbstractKeyManagementSystem}
 * that uses a local {@link @veramo/key-manager#AbstractPrivateKeyStore | AbstractPrivateKeyStore} to hold private key
 * material.
 *
 * The key material is used to provide local implementations of various cryptographic algorithms.
 *
 * @public
 */
export class KeyManagementSystem extends AbstractKeyManagementSystem {
  private readonly keyStore: AbstractPrivateKeyStore

  constructor(keyStore: AbstractPrivateKeyStore) {
    super()
    this.keyStore = keyStore
  }

  async importKey(args: Omit<MinimalImportableKey, 'kms'>): Promise<ManagedKeyInfo> {
    if (!args.type || !args.privateKeyHex) {
      throw new Error('invalid_argument: type and privateKeyHex are required to import a key')
    }
    const managedKey = this.asManagedKeyInfo({ alias: args.kid, ...args })
    await this.keyStore.importKey({ alias: managedKey.kid, ...args })
    debug('imported key', managedKey.type, managedKey.publicKeyHex)
    return managedKey
  }

  async listKeys(): Promise<ManagedKeyInfo[]> {
    const privateKeys = await this.keyStore.listKeys({})
    const managedKeys = privateKeys.map((key) => this.asManagedKeyInfo(key))
    return managedKeys
  }

  async createKey({ type }: { type: TKeyType }): Promise<ManagedKeyInfo> {
    let key: ManagedKeyInfo

    switch (type) {
      case 'Ed25519': {
        const keyPairEd25519 = generateSigningKeyPair()
        key = await this.importKey({
          type,
          privateKeyHex: u8a.toString(keyPairEd25519.secretKey, 'base16'),
        })
        break
      }
      case 'Secp256r1': // Generation uses exactly the same input mechanism for both Secp256k1 and Secp256r1
      case 'Secp256k1': {
        const privateBytes = randomBytes(32)
        key = await this.importKey({
          type,
          privateKeyHex: u8a.toString(privateBytes, 'base16'),
        })
        break
      }
      case 'X25519': {
        const keyPairX25519 = generateEncryptionKeypair()
        key = await this.importKey({
          type,
          privateKeyHex: u8a.toString(keyPairX25519.secretKey, 'base16'),
        })
        break
      }
      default:
        throw Error('not_supported: Key type not supported: ' + type)
    }

    debug('Created key', type, key.publicKeyHex)

    return key
  }

  async deleteKey(args: { kid: string }) {
    return await this.keyStore.deleteKey({ alias: args.kid })
  }

  async sign({
    keyRef,
    algorithm,
    data,
  }: {
    keyRef: Pick<IKey, 'kid'>
    algorithm?: string
    data: Uint8Array
  }): Promise<string> {
    let managedKey: ManagedPrivateKey
    try {
      managedKey = await this.keyStore.getKey({ alias: keyRef.kid })
    } catch (e) {
      throw new Error(`key_not_found: No key entry found for kid=${keyRef.kid}`)
    }

    if (
      managedKey.type === 'Ed25519' &&
      (typeof algorithm === 'undefined' || ['Ed25519', 'EdDSA'].includes(algorithm))
    ) {
      return await this.signEdDSA(managedKey.privateKeyHex, data)
    } else if (managedKey.type === 'Secp256k1') {
      if (typeof algorithm === 'undefined' || ['ES256K', 'ES256K-R'].includes(algorithm)) {
        return await this.signES256K(managedKey.privateKeyHex, algorithm, data)
      } else if (['eth_signTransaction', 'signTransaction', 'signTx'].includes(algorithm)) {
        return await this.eth_signTransaction(managedKey.privateKeyHex, data)
      } else if (algorithm === 'eth_signMessage') {
        return await this.eth_signMessage(managedKey.privateKeyHex, data)
      } else if (['eth_signTypedData', 'EthereumEip712Signature2021'].includes(algorithm)) {
        return await this.eth_signTypedData(managedKey.privateKeyHex, data)
      } else if (['eth_rawSign'].includes(algorithm)) {
        return this.eth_rawSign(managedKey.privateKeyHex, data)
      }
    } else if (
      managedKey.type === 'Secp256r1' &&
      (typeof algorithm === 'undefined' || algorithm === 'ES256')
    ) {
      return await this.signES256(managedKey.privateKeyHex, data)
    }

    throw Error(`not_supported: Cannot sign ${algorithm} using key of type ${managedKey.type}`)
  }

  async sharedSecret(args: {
    myKeyRef: Pick<IKey, 'kid'>
    theirKey: Pick<IKey, 'type' | 'publicKeyHex'>
  }): Promise<string> {
    let myKey: ManagedPrivateKey
    try {
      myKey = await this.keyStore.getKey({ alias: args.myKeyRef.kid })
    } catch (e) {
      throw new Error(`key_not_found: No key entry found for kid=${args.myKeyRef.kid}`)
    }
    if (!myKey.privateKeyHex) {
      throw Error('key_not_managed: No private key is available for kid: ' + myKey.alias)
    }
    let theirKey: Pick<IKey, 'type' | 'publicKeyHex'> = args.theirKey
    if (
      !theirKey.type ||
      typeof theirKey.type !== 'string' ||
      !theirKey.publicKeyHex ||
      typeof theirKey.publicKeyHex !== 'string'
    ) {
      throw new Error(`invalid_argument: args.theirKey must contain 'type' and 'publicKeyHex'`)
    }
    let myKeyBytes = arrayify('0x' + myKey.privateKeyHex)
    if (myKey.type === 'Ed25519') {
      myKeyBytes = convertSecretKeyToX25519(myKeyBytes)
    } else if (myKey.type !== 'X25519') {
      throw new Error(`not_supported: can't compute shared secret for type=${myKey.type}`)
    }
    let theirKeyBytes = arrayify('0x' + theirKey.publicKeyHex)
    if (theirKey.type === 'Ed25519') {
      theirKeyBytes = convertPublicKeyToX25519(theirKeyBytes)
    } else if (theirKey.type !== 'X25519') {
      throw new Error(`not_supported: can't compute shared secret for type=${theirKey.type}`)
    }
    const shared = sharedKey(myKeyBytes, theirKeyBytes)
    return hexlify(shared).substring(2)
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
    delete msgTypes.EIP712Domain
    const wallet = new Wallet(privateKeyHex)

    const signature = await wallet._signTypedData(msgDomain, msgTypes, msg)
    // HEX encoded string
    return signature
  }

  /**
   * @returns a `0x` prefixed hex string representing the signed message
   */
  private async eth_signMessage(privateKeyHex: string, rawMessageBytes: Uint8Array) {
    const wallet = new Wallet(privateKeyHex)
    const signature = await wallet.signMessage(rawMessageBytes)
    // HEX encoded string, 0x prefixed
    return signature
  }

  /**
   * @returns a `0x` prefixed hex string representing the signed raw transaction
   */
  private async eth_signTransaction(privateKeyHex: string, rlpTransaction: Uint8Array) {
    const { v, r, s, from, ...tx } = parse(rlpTransaction)
    const wallet = new Wallet(privateKeyHex)
    if (from) {
      debug('WARNING: executing a transaction signing request with a `from` field.')
      if (wallet.address.toLowerCase() !== from.toLowerCase()) {
        const msg =
          'invalid_arguments: eth_signTransaction `from` field does not match the chosen key. `from` field should be omitted.'
        debug(msg)
        throw new Error(msg)
      }
    }
    const signedRawTransaction = await wallet.signTransaction(<TransactionRequest>tx)
    // HEX encoded string, 0x prefixed
    return signedRawTransaction
  }

  /**
   * @returns a `0x` prefixed hex string representing the signed digest in compact format
   */
  private eth_rawSign(managedKey: string, data: Uint8Array) {
    return new SigningKey('0x' + managedKey).signDigest(data).compact
  }

  /**
   * @returns a base64url encoded signature for the `EdDSA` alg
   */
  private async signEdDSA(key: string, data: Uint8Array): Promise<string> {
    const signer = EdDSASigner(arrayify(key, { allowMissingPrefix: true }))
    const signature = await signer(data)
    // base64url encoded string
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
    const signer = ES256KSigner(arrayify(privateKeyHex, { allowMissingPrefix: true }), alg === 'ES256K-R')
    const signature = await signer(data)
    // base64url encoded string
    return signature as string
  }

  /**
   * @returns a base64url encoded signature for the `ES256` alg
   */
  private async signES256(privateKeyHex: string, data: Uint8Array): Promise<string> {
    const signer = ES256Signer(arrayify(privateKeyHex, { allowMissingPrefix: true }))
    const signature = await signer(data)
    // base64url encoded string
    return signature as string
  }

  /**
   * Converts a {@link @veramo/key-manager#ManagedPrivateKey | ManagedPrivateKey} to {@link @veramo/core-types#ManagedKeyInfo}
   */
  private asManagedKeyInfo(args: RequireOnly<ManagedPrivateKey, 'privateKeyHex' | 'type'>): ManagedKeyInfo {
    let key: Partial<ManagedKeyInfo>
    switch (args.type) {
      case 'Ed25519': {
        const secretKey = u8a.fromString(args.privateKeyHex.toLowerCase(), 'base16')
        const publicKeyHex = u8a.toString(extractPublicKeyFromSecretKey(secretKey), 'base16')
        key = {
          type: args.type,
          kid: args.alias || publicKeyHex,
          publicKeyHex,
          meta: {
            algorithms: ['Ed25519', 'EdDSA'],
          },
        }
        break
      }
      case 'Secp256k1': {
        const privateBytes = u8a.fromString(args.privateKeyHex.toLowerCase(), 'base16')
        const keyPair = new SigningKey(privateBytes)
        const publicKeyHex = keyPair.publicKey.substring(2)
        key = {
          type: args.type,
          kid: args.alias || publicKeyHex,
          publicKeyHex,
          meta: {
            algorithms: [
              'ES256K',
              'ES256K-R',
              'eth_signTransaction',
              'eth_signTypedData',
              'eth_signMessage',
              'eth_rawSign',
            ],
          },
        }
        break
      }
      case 'Secp256r1': {
        const privateBytes = u8a.fromString(args.privateKeyHex.toLowerCase(), 'base16')
        const secp256r1 = new elliptic.ec('p256')
        const keyPair: elliptic.ec.KeyPair = secp256r1.keyFromPrivate(privateBytes)
        const publicKeyHex = keyPair.getPublic(true, 'hex')
        key = {
          type: args.type,
          kid: args.alias || publicKeyHex,
          publicKeyHex,
          meta: {
            algorithms: ['ES256'],
          },
        }
        break
      }
      case 'X25519': {
        const secretKeyBytes = u8a.fromString(args.privateKeyHex.toLowerCase(), 'base16')
        const keyPairX25519 = generateEncryptionKeyPairFromSeed(secretKeyBytes)
        const publicKeyHex = u8a.toString(keyPairX25519.publicKey, 'base16')
        key = {
          type: args.type,
          kid: args.alias || publicKeyHex,
          publicKeyHex: publicKeyHex,
          meta: {
            algorithms: ['ECDH', 'ECDH-ES', 'ECDH-1PU'],
          },
        }
        break
      }
      default:
        throw Error('not_supported: Key type not supported: ' + args.type)
    }
    return key as ManagedKeyInfo
  }
}
