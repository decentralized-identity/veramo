import { TKeyType, IKey } from 'daf-core'
import { AbstractKeyManagementSystem } from 'daf-key-manager'
import sodium from 'libsodium-wrappers'
import { SimpleSigner } from 'did-jwt'
const EC = require('elliptic').ec
const secp256k1 = new EC('secp256k1')
import { DIDComm } from './didcomm'
const didcomm = new DIDComm()
import { sign } from 'ethjs-signer'
import Debug from 'debug'
const debug = Debug('daf:sodium:kms')

export class KeyManagementSystem extends AbstractKeyManagementSystem {
  async createKey({ type }: { type: TKeyType }): Promise<Omit<IKey, 'kms'>> {
    let key: Omit<IKey, 'kms'>

    switch (type) {
      case 'Ed25519':
        await sodium.ready
        const keyPairEd25519 = sodium.crypto_sign_keypair()
        key = {
          type,
          kid: Buffer.from(keyPairEd25519.publicKey).toString('hex'),
          publicKeyHex: Buffer.from(keyPairEd25519.publicKey).toString('hex'),
          privateKeyHex: Buffer.from(keyPairEd25519.privateKey).toString('hex'),
        }
        break
      case 'Secp256k1':
        const keyPairSecp256k1 = secp256k1.genKeyPair()
        key = {
          type,
          kid: keyPairSecp256k1.getPublic('hex'),
          publicKeyHex: keyPairSecp256k1.getPublic('hex'),
          privateKeyHex: keyPairSecp256k1.getPrivate('hex'),
        }
        break
      default:
        throw Error('Key type not supported: ' + type)
    }

    debug('Created key', type, key.publicKeyHex)

    return key
  }

  async deleteKey(args: { kid: string }) {
    // this kms doesn't need to delete keys
    return true
  }

  async encryptJWE({ key, to, data }: { key: IKey; to: IKey; data: string }): Promise<string> {
    await didcomm.ready
    return await didcomm.pack_anon_msg_for_recipients(data, [
      Uint8Array.from(Buffer.from(to.publicKeyHex, 'hex')),
    ])
  }

  async decryptJWE({ key, data }: { key: IKey; data: string }): Promise<string> {
    if (!key.privateKeyHex) throw Error('No private key')

    await didcomm.ready
    const unpackMessage = await didcomm.unpackMessage(data, {
      keyType: 'ed25519',
      publicKey: Uint8Array.from(Buffer.from(key.publicKeyHex, 'hex')),
      privateKey: Uint8Array.from(Buffer.from(key.privateKeyHex, 'hex')),
    })

    return unpackMessage.message
  }

  async signEthTX({ key, transaction }: { key: IKey; transaction: object }): Promise<string> {
    return sign(transaction, '0x' + key.privateKeyHex)
  }

  async signJWT({ key, data }: { key: IKey; data: string }): Promise<string> {
    if (!key.privateKeyHex) throw Error('No private key for kid: ' + key.kid)
    const signer = SimpleSigner(key.privateKeyHex)
    return (signer(data) as any) as string
  }
}
