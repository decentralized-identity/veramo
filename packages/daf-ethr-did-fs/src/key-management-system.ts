import { AbstractKeyManagementSystem, KeyType, AbstractKey, SerializedKey } from 'daf-core'
import * as sodium from 'libsodium-wrappers'
import { SimpleSigner } from 'did-jwt'
const EC = require('elliptic').ec
const secp256k1 = new EC('secp256k1')
const fs = require('fs')
import { DIDComm } from './didcomm'
const didcomm = new DIDComm()

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
}

interface FileContents {
  [kid: string]: SerializedKey
}

export class KeyManagementSystem extends AbstractKeyManagementSystem {
  constructor(private fileName: string) {
    super()
  }

  private readFromFile(): FileContents {
    try {
      const raw = fs.readFileSync(this.fileName)
      return JSON.parse(raw) as FileContents
    } catch (e) {
      return {}
    }
  }

  private writeToFile(json: FileContents) {
    return fs.writeFileSync(this.fileName, JSON.stringify(json))
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
    }

    const fileContents = this.readFromFile()
    fileContents[serializedKey.kid] = serializedKey
    this.writeToFile(fileContents)

    return new Key(serializedKey)
  }

  async getKey(kid: string) {
    const fileContents = this.readFromFile()
    const serializedKey = fileContents[kid]
    if (!serializedKey) throw Error('Key not found')
    return new Key(serializedKey)
  }

  async deleteKey(kid: string) {
    const fileContents = this.readFromFile()
    if (fileContents[kid]) {
      delete fileContents[kid]
      this.writeToFile(fileContents)
      return true
    }
    return false
  }
}
