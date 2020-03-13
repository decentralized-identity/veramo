import { SerializedKey } from './abstract-key-management-system'
import { AbstractKeyStore } from './abstract-key-store'

import { Key } from '../entities/key'

import Debug from 'debug'
const debug = Debug('daf:key-store')

export class KeyStore extends AbstractKeyStore {
  async get(kid: string) {
    const key = await Key.findOne(kid)
    if (!key) throw Error('Key not found')
    return key
  }

  async delete(kid: string) {
    const key = await Key.findOne(kid)
    if (!key) throw Error('Key not found')
    debug('Deleting key', kid)
    await key.remove()
    return true
  }

  async set(kid: string, serializedKey: SerializedKey) {
    const key = new Key()
    key.kid = kid
    key.privateKeyHex = serializedKey.privateKeyHex
    key.publicKeyHex = serializedKey.publicKeyHex
    key.type = serializedKey.type
    debug('Saving key', kid)
    await key.save()
    return true
  }
}
