import { AbstractKeyStore } from './abstract-key-store.js'
import { AbstractKeyManagementSystem } from './abstract-key-management-system.js'
import {
  IAgentPlugin,
  IKey,
  IKeyManager,
  IKeyManagerCreateArgs,
  IKeyManagerDecryptJWEArgs,
  IKeyManagerDeleteArgs,
  IKeyManagerEncryptJWEArgs,
  IKeyManagerGetArgs,
  IKeyManagerSharedSecretArgs,
  IKeyManagerSignArgs,
  IKeyManagerSignEthTXArgs,
  IKeyManagerSignJWTArgs,
  ManagedKeyInfo,
  MinimalImportableKey,
  TKeyType,
} from '@veramo/core-types'
import { schema } from '@veramo/core-types'
import * as u8a from 'uint8arrays'
import { createAnonDecrypter, createAnonEncrypter, createJWE, decryptJWE, type ECDH, type JWE } from 'did-jwt'
import { convertEd25519PublicKeyToX25519 } from '@veramo/utils'
import Debug from 'debug'
import { getBytes, hexlify, toUtf8Bytes, toUtf8String, computeAddress, Transaction } from 'ethers'

const debug = Debug('veramo:key-manager')

/**
 * Agent plugin that implements {@link @veramo/core-types#IKeyManager} methods.
 *
 * This plugin orchestrates various implementations of {@link AbstractKeyManagementSystem}, using a KeyStore to
 * remember the link between a key reference, its metadata, and the respective key management system that provides the
 * actual cryptographic capabilities.
 *
 * The methods of this plugin are used automatically by other plugins, such as
 * {@link @veramo/did-manager#DIDManager | DIDManager},
 * {@link @veramo/credential-w3c#CredentialPlugin | CredentialPlugin}, or {@link @veramo/did-comm#DIDComm | DIDComm} to
 * perform their required cryptographic operations using the managed keys.
 *
 * @public
 */
export class KeyManager implements IAgentPlugin {
  /**
   * Plugin methods
   * @public
   */
  readonly methods: IKeyManager

  readonly schema = schema.IKeyManager

  private store: AbstractKeyStore
  private kms: Record<string, AbstractKeyManagementSystem>

  constructor(options: { store: AbstractKeyStore; kms: Record<string, AbstractKeyManagementSystem> }) {
    this.store = options.store
    this.kms = options.kms
    this.methods = {
      keyManagerGetKeyManagementSystems: this.keyManagerGetKeyManagementSystems.bind(this),
      keyManagerCreate: this.keyManagerCreate.bind(this),
      keyManagerGet: this.keyManagerGet.bind(this),
      keyManagerDelete: this.keyManagerDelete.bind(this),
      keyManagerImport: this.keyManagerImport.bind(this),
      keyManagerEncryptJWE: this.keyManagerEncryptJWE.bind(this),
      keyManagerDecryptJWE: this.keyManagerDecryptJWE.bind(this),
      keyManagerSignJWT: this.keyManagerSignJWT.bind(this),
      keyManagerSignEthTX: this.keyManagerSignEthTX.bind(this),
      keyManagerSign: this.keyManagerSign.bind(this),
      keyManagerSharedSecret: this.keyManagerSharedSecret.bind(this),
    }
  }

  private getKms(name: string): AbstractKeyManagementSystem {
    const kms = this.kms[name]
    if (!kms) {
      throw Error(`invalid_argument: This agent has no registered KeyManagementSystem with name='${name}'`)
    }
    return kms
  }

  /** {@inheritDoc @veramo/core-types#IKeyManager.keyManagerGetKeyManagementSystems} */
  async keyManagerGetKeyManagementSystems(): Promise<Array<string>> {
    return Object.keys(this.kms)
  }

  /** {@inheritDoc @veramo/core-types#IKeyManager.keyManagerCreate} */
  async keyManagerCreate(args: IKeyManagerCreateArgs): Promise<ManagedKeyInfo> {
    const kms = this.getKms(args.kms)
    const partialKey = await kms.createKey({ type: args.type, meta: args.meta })
    const key: IKey = { ...partialKey, kms: args.kms }
    if (args.meta || key.meta) {
      key.meta = { ...args.meta, ...key.meta }
    }
    await this.store.importKey(key)
    if (key.privateKeyHex) {
      delete key.privateKeyHex
    }
    return key
  }

  /** {@inheritDoc @veramo/core-types#IKeyManager.keyManagerGet} */
  async keyManagerGet({ kid }: IKeyManagerGetArgs): Promise<IKey> {
    return this.store.getKey({ kid })
  }

  /** {@inheritDoc @veramo/core-types#IKeyManager.keyManagerDelete} */
  async keyManagerDelete({ kid }: IKeyManagerDeleteArgs): Promise<boolean> {
    const key = await this.store.getKey({ kid })
    const kms = this.getKms(key.kms)
    await kms.deleteKey({ kid })
    return this.store.deleteKey({ kid })
  }

  /** {@inheritDoc @veramo/core-types#IKeyManager.keyManagerImport} */
  async keyManagerImport(key: MinimalImportableKey): Promise<ManagedKeyInfo> {
    const kms = this.getKms(key.kms)
    const managedKey = await kms.importKey(key)
    const { meta } = key
    const importedKey = { ...managedKey, meta: { ...meta, ...managedKey.meta }, kms: key.kms }
    await this.store.importKey(importedKey)
    return importedKey
  }

  /** {@inheritDoc @veramo/core-types#IKeyManager.keyManagerEncryptJWE} */
  async keyManagerEncryptJWE({ kid, to, data }: IKeyManagerEncryptJWEArgs): Promise<string> {
    // TODO: if a sender `key` is provided, then it should be used to create an authenticated encrypter
    // const key = await this.store.get({ kid })

    let recipientPublicKey: Uint8Array
    if (to.type === 'Ed25519') {
      recipientPublicKey = getBytes('0x' + to.publicKeyHex)
      recipientPublicKey = convertEd25519PublicKeyToX25519(recipientPublicKey)
    } else if (to.type === 'X25519') {
      recipientPublicKey = getBytes('0x' + to.publicKeyHex)
    } else {
      throw new Error('not_supported: The recipient public key type is not supported')
    }

    const dataBytes = toUtf8Bytes(data)
    const encrypter = createAnonEncrypter(recipientPublicKey)
    const result: JWE = await createJWE(dataBytes, [encrypter])

    return JSON.stringify(result)
  }

  /** {@inheritDoc @veramo/core-types#IKeyManager.keyManagerDecryptJWE} */
  async keyManagerDecryptJWE({ kid, data }: IKeyManagerDecryptJWEArgs): Promise<string> {
    const jwe: JWE = JSON.parse(data)
    const ecdh = this.createX25519ECDH(kid)

    // TODO: figure out if the JWE is anon or not to determine the type of decrypter to use
    const decrypter = createAnonDecrypter(ecdh)

    const decrypted = await decryptJWE(jwe, decrypter)
    const result = toUtf8String(decrypted)
    return result
  }

  /** {@inheritDoc @veramo/core-types#IKeyManager.keyManagerSignJWT} */
  async keyManagerSignJWT({ kid, data }: IKeyManagerSignJWTArgs): Promise<string> {
    if (typeof data === 'string') {
      return this.keyManagerSign({ keyRef: kid, data, encoding: 'utf-8' })
    } else {
      const dataString = u8a.toString(data, 'base16')
      return this.keyManagerSign({ keyRef: kid, data: dataString, encoding: 'base16' })
    }
  }

  /** {@inheritDoc @veramo/core-types#IKeyManager.keyManagerSign} */
  async keyManagerSign(args: IKeyManagerSignArgs): Promise<string> {
    const { keyRef, data, algorithm, encoding, ...extras } = { encoding: 'utf-8', ...args }
    const keyInfo: ManagedKeyInfo = await this.store.getKey({ kid: keyRef })
    let dataBytes
    if (typeof data === 'string') {
      if (encoding === 'base16' || encoding === 'hex') {
        const preData = data.startsWith('0x') ? data.substring(2) : data
        dataBytes = u8a.fromString(preData, 'base16')
      } else {
        dataBytes = u8a.fromString(data, <'utf-8'>encoding)
      }
    } else {
      dataBytes = data
    }
    const kms = this.getKms(keyInfo.kms)
    return kms.sign({ keyRef: keyInfo, algorithm, data: dataBytes, ...extras })
  }

  /** {@inheritDoc @veramo/core-types#IKeyManager.keyManagerSignEthTX} */
  async keyManagerSignEthTX({ kid, transaction }: IKeyManagerSignEthTXArgs): Promise<string> {
    const { v, r, s, from, ...tx } = <any>transaction
    if (typeof from === 'string') {
      debug('WARNING: executing a transaction signing request with a `from` field.')
      const key = await this.store.getKey({ kid })
      if (key.publicKeyHex) {
        const address = computeAddress('0x' + key.publicKeyHex)
        if (address.toLowerCase() !== from.toLowerCase()) {
          const msg =
            'invalid_arguments: keyManagerSignEthTX `from` field does not match the chosen key. `from` field should be omitted.'
          debug(msg)
          throw new Error(msg)
        }
      }
    }
    const data = Transaction.from(tx).unsignedSerialized
    const algorithm = 'eth_signTransaction'
    return this.keyManagerSign({ keyRef: kid, data, algorithm, encoding: 'base16' })
  }

  /** {@inheritDoc @veramo/core-types#IKeyManager.keyManagerSharedSecret} */
  async keyManagerSharedSecret(args: IKeyManagerSharedSecretArgs): Promise<string> {
    const { secretKeyRef, publicKey } = args
    const myKeyRef = await this.store.getKey({ kid: secretKeyRef })
    const theirKey = publicKey
    if (
      myKeyRef.type === theirKey.type ||
      (['Ed25519', 'X25519'].includes(myKeyRef.type) && ['Ed25519', 'X25519'].includes(theirKey.type))
    ) {
      const kms = this.getKms(myKeyRef.kms)
      return kms.sharedSecret({ myKeyRef, theirKey })
    } else {
      throw new Error('invalid_argument: the key types have to match to be able to compute a shared secret')
    }
  }

  createX25519ECDH(secretKeyRef: string): ECDH {
    return async (theirPublicKey: Uint8Array): Promise<Uint8Array> => {
      if (theirPublicKey.length !== 32) {
        throw new Error('invalid_argument: incorrect publicKey key length for X25519')
      }
      const publicKey = { type: <TKeyType>'X25519', publicKeyHex: hexlify(theirPublicKey).substring(2) }
      const shared = await this.keyManagerSharedSecret({ secretKeyRef, publicKey })
      return getBytes('0x' + shared)
    }
  }
}
