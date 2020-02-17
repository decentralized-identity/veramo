import { AbstractIdentityStore, SerializedIdentity } from 'daf-core'
import Debug from 'debug'
const debug = Debug('daf:local-storage:identity-store')

interface StorageContents {
  [did: string]: SerializedIdentity
}

export class IdentityStore extends AbstractIdentityStore {
  constructor(private type: string) {
    super()
  }

  async get(did: string) {
    const fileContents = this.readFromStorage()
    if (!fileContents[did]) throw Error('Identity not found')
    return fileContents[did]
  }

  async delete(did: string) {
    const fileContents = this.readFromStorage()
    if (!fileContents[did]) throw Error('Identity not found')
    delete fileContents[did]
    debug('Deleting', did)
    return this.writeToStorage(fileContents)
  }

  async set(did: string, serializedIdentity: SerializedIdentity) {
    const fileContents = this.readFromStorage()
    fileContents[did] = serializedIdentity
    debug('Saving', did)
    return this.writeToStorage(fileContents)
  }

  async listDids() {
    const fileContents = this.readFromStorage()
    return Object.keys(fileContents)
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
