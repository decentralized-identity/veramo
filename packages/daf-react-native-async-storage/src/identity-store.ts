import { AbstractIdentityStore, SerializedIdentity } from 'daf-core'
import AsyncStorage from '@react-native-community/async-storage'
import Debug from 'debug'
const debug = Debug('daf:react-native-async-storage:identity-store')

interface StorageContents {
  [did: string]: SerializedIdentity
}

export class IdentityStore extends AbstractIdentityStore {
  constructor(private type: string) {
    super()
  }

  async get(did: string) {
    const fileContents = await this.readFromStorage()
    if (!fileContents[did]) throw Error('Identity not found')
    return fileContents[did]
  }

  async delete(did: string) {
    const fileContents = await this.readFromStorage()
    if (!fileContents[did]) throw Error('Identity not found')
    delete fileContents[did]
    debug('Deleting', did)
    return this.writeToStorage(fileContents)
  }

  async set(did: string, serializedIdentity: SerializedIdentity) {
    const fileContents = await this.readFromStorage()
    fileContents[did] = serializedIdentity
    debug('Saving', did)
    return this.writeToStorage(fileContents)
  }

  async listDids() {
    const fileContents = await this.readFromStorage()
    return Object.keys(fileContents)
  }

  private async readFromStorage(): Promise<StorageContents> {
    try {
      const raw = (await AsyncStorage.getItem(this.type)) || ''
      return JSON.parse(raw) as StorageContents
    } catch (e) {
      return {}
    }
  }

  private async writeToStorage(json: StorageContents) {
    await AsyncStorage.setItem(this.type, JSON.stringify(json))
    return true
  }
}
