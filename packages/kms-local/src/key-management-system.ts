import {
  IKey,
  KEY_ALG_MAPPING,
  ManagedKeyInfo,
  MinimalImportableKey,
  RequireOnly,
  TKeyType,
} from '@veramo/core-types'
import {
  AbstractKeyManagementSystem,
  AbstractPrivateKeyStore,
  Eip712Payload,
  ManagedPrivateKey,
} from '@veramo/key-manager'

import { EdDSASigner, ES256KSigner, ES256Signer } from 'did-jwt'
import { ed25519, x25519 } from '@noble/curves/ed25519'
import { p256 } from '@noble/curves/p256'
import {
  TransactionRequest,
  toUtf8String,
  Wallet,
  SigningKey,
  randomBytes,
  getBytes,
  hexlify,
  Transaction,
  decodeRlp
} from 'ethers'
import Debug from 'debug'
import {
  bytesToHex,
  concat,
  convertEd25519PrivateKeyToX25519,
  convertEd25519PublicKeyToX25519,
  hexToBytes,
} from '@veramo/utils'

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
        const ed25519SecretKey = ed25519.utils.randomPrivateKey()
        const publicKey = ed25519.utils.getExtendedPublicKey(ed25519SecretKey).pointBytes
        key = await this.importKey({
          type,
          privateKeyHex: bytesToHex(concat([ed25519SecretKey, publicKey])),
        })
        break
      }
      case 'Secp256r1': // Generation uses exactly the same input mechanism for both Secp256k1 and Secp256r1
      case 'Secp256k1': {
        const privateBytes = randomBytes(32)
        key = await this.importKey({
          type,
          privateKeyHex: bytesToHex(privateBytes),
        })
        break
      }
      case 'X25519': {
        const secretX25519 = x25519.utils.randomPrivateKey()
        key = await this.importKey({
          type,
          privateKeyHex: bytesToHex(secretX25519),
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
    let myKeyBytes = getBytes('0x' + myKey.privateKeyHex)
    if (myKey.type === 'Ed25519') {
      myKeyBytes = convertEd25519PrivateKeyToX25519(myKeyBytes)
    } else if (myKey.type !== 'X25519') {
      throw new Error(`not_supported: can't compute shared secret for type=${myKey.type}`)
    }
    let theirKeyBytes = getBytes('0x' + theirKey.publicKeyHex)
    if (theirKey.type === 'Ed25519') {
      theirKeyBytes = convertEd25519PublicKeyToX25519(theirKeyBytes)
    } else if (theirKey.type !== 'X25519') {
      throw new Error(`not_supported: can't compute shared secret for type=${theirKey.type}`)
    }
    const shared = x25519.getSharedSecret(myKeyBytes, theirKeyBytes)
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

    const signature = await wallet.signTypedData(msgDomain, msgTypes, msg)
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
    const transaction = Transaction.from(bytesToHex(rlpTransaction, true))
    const wallet = new Wallet(privateKeyHex)
    if (transaction.from) {
      debug('WARNING: executing a transaction signing request with a `from` field.')
      if (wallet.address.toLowerCase() !== transaction.from.toLowerCase()) {
        const msg =
          'invalid_arguments: eth_signTransaction `from` field does not match the chosen key. `from` field should be omitted.'
        debug(msg)
        throw new Error(msg)
      }
    }
    const signedRawTransaction = await wallet.signTransaction(transaction)
    // HEX encoded string, 0x prefixed
    return signedRawTransaction
  }

  /**
   * @returns a `0x` prefixed hex string representing the signed digest in compact format
   */
  private eth_rawSign(managedKey: string, data: Uint8Array) {
    return new SigningKey('0x' + managedKey).sign(data).compactSerialized
  }

  /**
   * @returns a base64url encoded signature for the `EdDSA` alg
   */
  private async signEdDSA(key: string, data: Uint8Array): Promise<string> {
    const signer = EdDSASigner(hexToBytes(key))
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
    const signer = ES256KSigner(hexToBytes(privateKeyHex), alg === 'ES256K-R')
    const signature = await signer(data)
    // base64url encoded string
    return signature as string
  }

  /**
   * @returns a base64url encoded signature for the `ES256` alg
   */
  private async signES256(privateKeyHex: string, data: Uint8Array): Promise<string> {
    const signer = ES256Signer(hexToBytes(privateKeyHex))
    const signature = await signer(data)
    // base64url encoded string
    return signature as string
  }

  /**
   * Converts a {@link @veramo/key-manager#ManagedPrivateKey | ManagedPrivateKey} to
   * {@link @veramo/core-types#ManagedKeyInfo}
   */
  private asManagedKeyInfo(args: RequireOnly<ManagedPrivateKey, 'privateKeyHex' | 'type'>): ManagedKeyInfo {
    let key: Partial<ManagedKeyInfo>
    switch (args.type) {
      case 'Ed25519': {
        const secretKey = hexToBytes(args.privateKeyHex.toLowerCase())
        const publicKeyHex = bytesToHex(ed25519.getPublicKey(secretKey.subarray(0, 32)))
        key = {
          type: args.type,
          kid: args.alias || publicKeyHex,
          publicKeyHex,
          meta: {
            algorithms: [...KEY_ALG_MAPPING[args.type], 'Ed25519'],
          },
        }
        break
      }
      case 'Secp256k1': {
        const privateBytes = hexToBytes(args.privateKeyHex.toLowerCase())
        const keyPair = new SigningKey(privateBytes)
        const publicKeyHex = keyPair.publicKey.substring(2)
        key = {
          type: args.type,
          kid: args.alias || publicKeyHex,
          publicKeyHex,
          meta: {
            algorithms: [
              ...KEY_ALG_MAPPING[args.type],
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
        const privateBytes = hexToBytes(args.privateKeyHex.toLowerCase())
        const publicKeyHex = bytesToHex(p256.getPublicKey(privateBytes, true))
        key = {
          type: args.type,
          kid: args.alias || publicKeyHex,
          publicKeyHex,
          meta: {
            algorithms: ['ES256'], // ECDH not supported yet by this KMS
          },
        }
        break
      }
      case 'X25519': {
        const secretKeyBytes = hexToBytes(args.privateKeyHex.toLowerCase())
        const publicKeyHex = bytesToHex(x25519.getPublicKey(secretKeyBytes))
        key = {
          type: args.type,
          kid: args.alias || publicKeyHex,
          publicKeyHex: publicKeyHex,
          meta: {
            algorithms: [...KEY_ALG_MAPPING[args.type]],
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
