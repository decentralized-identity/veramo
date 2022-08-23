import { AbstractKeyStore } from '../../../key-manager'
import { AbstractKeyManagementSystem } from '../../../key-manager'
import {
  IKey,
  IKeyManager,
  IAgentPlugin,
  IKeyManagerCreateArgs,
  IKeyManagerGetArgs,
  IKeyManagerDeleteArgs,
  IKeyManagerEncryptJWEArgs,
  IKeyManagerDecryptJWEArgs,
  IKeyManagerSignJWTArgs,
  IKeyManagerSignEthTXArgs,
  schema,
  IKeyManagerSignArgs,
  IKeyManagerSharedSecretArgs,
  TKeyType,
  MinimalImportableKey,
  ManagedKeyInfo,
} from '@veramo/core'
import * as u8a from 'uint8arrays'
import { JWE, createAnonDecrypter, createAnonEncrypter, createJWE, decryptJWE, ECDH } from 'did-jwt'
import { arrayify, hexlify } from '@ethersproject/bytes'
import { serialize, computeAddress } from '@ethersproject/transactions'
import { toUtf8String, toUtf8Bytes } from '@ethersproject/strings'
import { convertPublicKeyToX25519 } from '@stablelib/ed25519'
import Debug from 'debug'

const debug = Debug('veramo:key-manager')

/**
 * Agent plugin that implements {@link @veramo/core#IKeyManager} methods.
 *
 * This plugin orchestrates various implementations of {@link AbstractKeyManagementSystem}, using a KeyStore to
 * remember the link between a key reference, its metadata, and the respective key management system that provides the
 * actual cryptographic capabilities.
 *
 * The methods of this plugin are used automatically by other plugins, such as
 * {@link @veramo/did-manager#DIDManager | DIDManager},
 * {@link @veramo/credential-w3c#CredentialIssuer | CredentialIssuer}, or {@link @veramo/did-comm#DIDComm | DIDComm} to
 * perform their required cryptographic operations using the managed keys.
 *
 * @public
 */
export class MockKeyManager implements IAgentPlugin {
  /**
   * Plugin methods
   * @public
   */
  readonly methods: IKeyManager

  readonly schema = schema.IKeyManager

  constructor() {
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

  /** {@inheritDoc @veramo/core#IKeyManager.keyManagerGetKeyManagementSystems} */
  async keyManagerGetKeyManagementSystems(): Promise<Array<string>> {
    return []
  }

  /** {@inheritDoc @veramo/core#IKeyManager.keyManagerCreate} */
  async keyManagerCreate(args: IKeyManagerCreateArgs): Promise<ManagedKeyInfo> {
    return { kid: "x", type: "Ed25519", kms: "y", publicKeyHex: "z"}
  }

  /** {@inheritDoc @veramo/core#IKeyManager.keyManagerGet} */
  async keyManagerGet({ kid }: IKeyManagerGetArgs): Promise<IKey> {
    return {
      kid: '',
      kms: '',
      type: 'Ed25519',
      publicKeyHex: '',
    }
  }

  /** {@inheritDoc @veramo/core#IKeyManager.keyManagerDelete} */
  async keyManagerDelete({ kid }: IKeyManagerDeleteArgs): Promise<boolean> {
    return true
  }

  /** {@inheritDoc @veramo/core#IKeyManager.keyManagerImport} */
  async keyManagerImport(key: MinimalImportableKey): Promise<ManagedKeyInfo> {
    return { kid: "x", type: "Ed25519", kms: "y", publicKeyHex: "z"}
  }

  /** {@inheritDoc @veramo/core#IKeyManager.keyManagerEncryptJWE} */
  async keyManagerEncryptJWE({ kid, to, data }: IKeyManagerEncryptJWEArgs): Promise<string> {
    return "1"
  }

  /** {@inheritDoc @veramo/core#IKeyManager.keyManagerDecryptJWE} */
  async keyManagerDecryptJWE({ kid, data }: IKeyManagerDecryptJWEArgs): Promise<string> {
    return "1"
  }

  /** {@inheritDoc @veramo/core#IKeyManager.keyManagerSignJWT} */
  async keyManagerSignJWT({ kid, data }: IKeyManagerSignJWTArgs): Promise<string> {
    return "1"
  }

  /** {@inheritDoc @veramo/core#IKeyManager.keyManagerSign} */
  async keyManagerSign(args: IKeyManagerSignArgs): Promise<string> {
    return "mockJWT"
  }

  /** {@inheritDoc @veramo/core#IKeyManager.keyManagerSignEthTX} */
  async keyManagerSignEthTX({ kid, transaction }: IKeyManagerSignEthTXArgs): Promise<string> {
    return "1"
  }

  /** {@inheritDoc @veramo/core#IKeyManager.keyManagerSharedSecret} */
  async keyManagerSharedSecret(args: IKeyManagerSharedSecretArgs): Promise<string> {
    return "1"
  }
}
