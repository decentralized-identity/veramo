import { AbstractKeyStore, SerializedKey } from 'daf-core'
const fs = require('fs')
import Debug from 'debug'
const debug = Debug('daf:fs:key-store')

interface FileContents {
  [kid: string]: SerializedKey
}

export class KeyStore extends AbstractKeyStore {
  constructor(private fileName: string) {
    super()
  }

  async get(kid: string) {
    const fileContents = this.readFromFile()
    if (!fileContents[kid]) throw Error('Key not found')
    return fileContents[kid]
  }

  async delete(kid: string) {
    const fileContents = this.readFromFile()
    if (!fileContents[kid]) throw Error('Key not found')
    delete fileContents[kid]
    debug('Deleting key', kid)
    return this.writeToFile(fileContents)
  }

  async set(kid: string, serializedKey: SerializedKey) {
    const fileContents = this.readFromFile()
    fileContents[kid] = serializedKey
    debug('Saving key', kid)
    return this.writeToFile(fileContents)
  }

  private readFromFile(): FileContents {
    try {
      const raw = fs.readFileSync(this.fileName)
      return JSON.parse(raw) as FileContents
    } catch (e) {
      return {}
    }
  }

  private writeToFile(json: FileContents): boolean {
    try {
      fs.writeFileSync(this.fileName, JSON.stringify(json))
      return true
    } catch (e) {
      return false
    }
  }
}
