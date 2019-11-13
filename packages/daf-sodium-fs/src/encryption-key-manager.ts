import { EncryptionKeyManager, KeyPair } from 'daf-core'
import sodium from 'libsodium-wrappers'
const fs = require('fs')

import Debug from 'debug'
const debug = Debug('sodium-fs-encryption-key-manager')

interface DidKeyPairMap {
  [did: string]: KeyPair
}

export class SodiumFsEncryptionKeyManager implements EncryptionKeyManager {
  private didKeyPairMap: DidKeyPairMap = {}
  private fileName: string

  constructor(fileName: string) {
    this.fileName = fileName
    this.readFromFile()
  }

  private readFromFile(): void {
    try {
      if (fs.existsSync(this.fileName)) {
        const raw = fs.readFileSync(this.fileName)
        const parsed = JSON.parse(raw)
        
        Object.keys(parsed).forEach(did => {
          const i = parsed[did]
          this.didKeyPairMap[did] = {
            keyType: i.keyType,
            privateKeyHex: i.privateKeyHex,
            publicKeyHex: i.publicKeyHex,
            privateKey: Uint8Array.from(Buffer.from(i.privateKeyHex, 'hex')),
            publicKey: Uint8Array.from(Buffer.from(i.publicKeyHex, 'hex')),
          }
        })
      }
    } catch (e) {
      debug(e)
    }
  }

  private writeToFile() {
    try {
      fs.writeFileSync(this.fileName, JSON.stringify(this.didKeyPairMap))
    } catch (e) {
      debug(e)
    }
  }

  async createKeyPairForDid(did: string): Promise<KeyPair> {
    await sodium.ready
    const keyPair = sodium.crypto_sign_keypair() as KeyPair
    keyPair.privateKeyHex = Buffer.from(keyPair.privateKey).toString('hex')
    keyPair.publicKeyHex = Buffer.from(keyPair.publicKey).toString('hex')
    this.didKeyPairMap[did] = keyPair
    this.writeToFile()
    debug('Created keyPair for %s', did)
    return keyPair
  }

  async getKeyPairForDid(did: string): Promise<KeyPair | null> {
    const keyPair = this.didKeyPairMap[did]
    if (!keyPair) {
      return null
    }
    return keyPair
  }

  async getKeyPairForPublicKey(publicKey: Uint8Array): Promise<KeyPair | null> {
    Object.keys(this.didKeyPairMap).forEach(did => {
      if (this.didKeyPairMap[did].publicKey === publicKey) {
        return this.didKeyPairMap[did]
      }
    })

    return null
  }

  async listKeyPairs(): Promise<KeyPair[]> {
    const list: KeyPair[] = []
    Object.keys(this.didKeyPairMap).forEach(did => {
      list.push(this.didKeyPairMap[did])
    })

    return list
  }
}
