import { IKey } from '@veramo/core'
import { AbstractKeyStore, AbstractSecretBox } from 'daf-key-manager'
import { Connection } from 'typeorm'

import { Key } from '../entities/key'

import Debug from 'debug'
const debug = Debug('veramo:typeorm:key-store')

export class KeyStore extends AbstractKeyStore {
  constructor(private dbConnection: Promise<Connection>, private secretBox?: AbstractSecretBox) {
    super()
    if (!secretBox) {
      console.warn('Please provide SecretBox to the KeyStore')
    }
  }

  async get({ kid }: { kid: string }): Promise<IKey> {
    const key = await (await this.dbConnection).getRepository(Key).findOne(kid)
    if (!key) throw Error('Key not found')
    if (this.secretBox && key.privateKeyHex) {
      key.privateKeyHex = await this.secretBox.decrypt(key.privateKeyHex)
    }
    return key
  }

  async delete({ kid }: { kid: string }) {
    const key = await (await this.dbConnection).getRepository(Key).findOne(kid)
    if (!key) throw Error('Key not found')
    debug('Deleting key', kid)
    await (await this.dbConnection).getRepository(Key).remove(key)
    return true
  }

  async import(args: IKey) {
    const key = new Key()
    key.kid = args.kid
    key.privateKeyHex = args.privateKeyHex
    if (this.secretBox && key.privateKeyHex) {
      key.privateKeyHex = await this.secretBox.encrypt(key.privateKeyHex)
    }
    key.publicKeyHex = args.publicKeyHex
    key.type = args.type
    key.kms = args.kms
    key.meta = args.meta
    debug('Saving key', args.kid)
    await (await this.dbConnection).getRepository(Key).save(key)
    return true
  }
}
