import { AbstractKeyManagementSystem, KeyType, AbstractKey, SerializedKey, AbstractKeyStore } from 'daf-core'
import sodium from 'react-native-sodium'
import { SimpleSigner } from 'did-jwt'
const EC = require('elliptic').ec
const secp256k1 = new EC('secp256k1')
import { DIDComm } from './didcomm'
const didcomm = new DIDComm()
import { sign } from 'ethjs-signer'
import Debug from 'debug'
const debug = Debug('daf:react-native-libsodium:kms')

export class Key extends AbstractKey {
  constructor(public serialized: SerializedKey) {
    super()
  }

  async encrypt(to: SerializedKey, data: string) {
    await didcomm.ready
    return await didcomm.pack_anon_msg_for_recipients(data, [
      Uint8Array.from(Buffer.from(to.publicKeyHex, 'hex')),
    ])
  }

  async decrypt(encrypted: string) {
    if (!this.serialized.privateKeyHex) throw Error('No private key')

    await didcomm.ready
    try {
      const unpackMessage = await didcomm.unpackMessage(encrypted, {
        keyType: 'ed25519',
        publicKey: Uint8Array.from(Buffer.from(this.serialized.publicKeyHex, 'hex')),
        privateKey: Uint8Array.from(Buffer.from(this.serialized.privateKeyHex, 'hex')),
      })

      return unpackMessage.message
    } catch (e) {
      return Promise.reject('Error: ' + e.message)
    }
  }

  signer() {
    if (!this.serialized.privateKeyHex) throw Error('No private key')
    return SimpleSigner(this.serialized.privateKeyHex)
  }

  signEthTransaction(transaction: object, callback: (error: string | null, signature: string) => void) {
    const signature = sign(transaction, '0x' + this.serialized.privateKeyHex)
    callback(null, signature)
  }
}

export class KeyManagementSystem extends AbstractKeyManagementSystem {
  constructor(private keyStore: AbstractKeyStore) {
    super()
  }

  async createKey(type: KeyType) {
    let serializedKey: SerializedKey

    switch (type) {
      case 'Ed25519':
        await sodium.ready
        const keyPairEd25519 = sodium.crypto_sign_keypair()
        serializedKey = {
          type,
          kid: Buffer.from(keyPairEd25519.publicKey).toString('hex'),
          publicKeyHex: Buffer.from(keyPairEd25519.publicKey).toString('hex'),
          privateKeyHex: Buffer.from(keyPairEd25519.privateKey).toString('hex'),
        }
        break
      case 'Secp256k1':
        const keyPairSecp256k1 = secp256k1.genKeyPair()
        serializedKey = {
          type,
          kid: keyPairSecp256k1.getPublic('hex'),
          publicKeyHex: keyPairSecp256k1.getPublic('hex'),
          privateKeyHex: keyPairSecp256k1.getPrivate('hex'),
        }
        break
      default:
        throw Error('Key type not supported: ' + type)
    }

    this.keyStore.set(serializedKey.kid, serializedKey)

    debug('Created key', type, serializedKey.publicKeyHex)

    return new Key(serializedKey)
  }

  async getKey(kid: string) {
    const serializedKey = await this.keyStore.get(kid)
    if (!serializedKey) throw Error('Key not found')
    return new Key(serializedKey)
  }

  async deleteKey(kid: string) {
    debug('Deleting', kid)
    return this.keyStore.delete(kid)
  }
}
