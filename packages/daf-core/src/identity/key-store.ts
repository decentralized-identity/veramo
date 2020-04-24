import { SerializedKey } from './abstract-key-management-system'
import { AbstractKeyStore } from './abstract-key-store'
import { AbstractSecretBox } from './abstract-secret-box'
import { Connection } from 'typeorm'

import { Key } from '../entities/key'

import Debug from 'debug'
const debug = Debug('daf:key-store')

export class KeyStore extends AbstractKeyStore {
  constructor(private dbConnection: Promise<Connection>, private secretBox?: AbstractSecretBox) {
    super()
    if (!secretBox) {
      console.warn('Please provide SecretBox to the KeyStore')
    }
  }

  async get(kid: string) {
    const key = await (await this.dbConnection).getRepository(Key).findOne(kid)
    if (!key) throw Error('Key not found')
    if (this.secretBox && key.privateKeyHex) {
      key.privateKeyHex = await this.secretBox.decrypt(key.privateKeyHex)
    }
    return key
  }

  async delete(kid: string) {
    const key = await (await this.dbConnection).getRepository(Key).findOne(kid)
    if (!key) throw Error('Key not found')
    debug('Deleting key', kid)
    await (await this.dbConnection).getRepository(Key).remove(key)
    return true
  }

  async set(kid: string, serializedKey: SerializedKey) {
    const key = new Key()
    key.kid = kid
    key.privateKeyHex = serializedKey.privateKeyHex
    if (this.secretBox && key.privateKeyHex) {
      key.privateKeyHex = await this.secretBox.encrypt(key.privateKeyHex)
    }
    key.publicKeyHex = serializedKey.publicKeyHex
    key.type = serializedKey.type
    debug('Saving key', kid)
    await (await this.dbConnection).getRepository(Key).save(key)
    return true
  }
}
