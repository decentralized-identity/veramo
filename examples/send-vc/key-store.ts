import { AbstractKeyStore, SerializedKey, Key } from 'daf-core'

import Debug from 'debug'
const debug = Debug('daf:orm:key-store')

export default class KeyStore extends AbstractKeyStore {
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
