import { AbstractKeyStore, SerializedKey } from 'daf-core'
import AsyncStorage from '@react-native-community/async-storage'
import Debug from 'debug'
const debug = Debug('daf:react-native-async-storage:key-store')

interface StorageContents {
  [kid: string]: SerializedKey
}

export class KeyStore extends AbstractKeyStore {
  constructor(private type: string) {
    super()
  }

  async get(kid: string) {
    const fileContents = await this.readFromStorage()
    if (!fileContents[kid]) throw Error('Key not found')
    return fileContents[kid]
  }

  async delete(kid: string) {
    const fileContents = await this.readFromStorage()
    if (!fileContents[kid]) throw Error('Key not found')
    delete fileContents[kid]
    debug('Deleting key', kid)
    return this.writeToStorage(fileContents)
  }

  async set(kid: string, serializedKey: SerializedKey) {
    const fileContents = await this.readFromStorage()
    fileContents[kid] = serializedKey
    debug('Saving key', kid)
    return this.writeToStorage(fileContents)
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
