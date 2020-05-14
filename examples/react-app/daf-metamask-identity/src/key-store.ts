import { SimpleSigner } from 'did-jwt'
import { AbstractKeyStore, SerializedKey } from 'daf-core'

import Debug from 'debug'
const debug = Debug('daf:fs:key-store')

interface StorageContents {
  [kid: string]: SerializedKey
}

export class KeyStore extends AbstractKeyStore {
  constructor(private type: string) {
    super()
  }

  async get(kid: string) {
    return Promise.reject('Not implemented')
  }

  async delete(kid: string) {
    return Promise.reject('Not implemented')
  }

  async set(kid: string, serializedKey: SerializedKey) {
    return Promise.reject('Not implemented')
  }
}
