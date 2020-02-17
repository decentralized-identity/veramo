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
    const fileContents = this.readFromStorage()
    if (!fileContents[kid]) throw Error('Key not found')
    return fileContents[kid]
  }

  async delete(kid: string) {
    const fileContents = this.readFromStorage()
    if (!fileContents[kid]) throw Error('Key not found')
    delete fileContents[kid]
    debug('Deleting key', kid)
    return this.writeToStorage(fileContents)
  }

  async set(kid: string, serializedKey: SerializedKey) {
    const fileContents = this.readFromStorage()
    fileContents[kid] = serializedKey
    debug('Saving key', kid)
    return this.writeToStorage(fileContents)
  }

  private readFromStorage(): StorageContents {
    try {
      const raw = window.localStorage.getItem(this.type) || ''
      return JSON.parse(raw) as StorageContents
    } catch (e) {
      return {}
    }
  }

  private writeToStorage(json: StorageContents) {
    window.localStorage.setItem(this.type, JSON.stringify(json))
    return true
  }
}
