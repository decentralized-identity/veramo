import { AbstractSecretBox, AbstractPrivateKeyStore } from '@veramo/key-manager'
import { ImportablePrivateKey, ManagedPrivateKey } from '@veramo/key-manager/src/abstract-private-key-store'
import { v4 as uuid4 } from 'uuid'
import Debug from 'debug'
import { VeramoJsonStore, DiffCallback } from '../types'
import structuredClone from '@ungap/structured-clone'

const debug = Debug('veramo:data-store-json:private-key-store')

export class PrivateKeyStoreJson extends AbstractPrivateKeyStore {
  private readonly cacheTree: Required<Pick<VeramoJsonStore, 'privateKeys'>>
  private readonly updateCallback: DiffCallback

  constructor(
    initialState: Pick<VeramoJsonStore, 'privateKeys'>,
    updateCallback?: DiffCallback | null,
    private secretBox?: AbstractSecretBox,
    private useDirectReferences: boolean = true,
  ) {
    super()
    this.cacheTree = (useDirectReferences ? initialState : structuredClone(initialState)) as Required<
      Pick<VeramoJsonStore, 'privateKeys'>
    >
    if (!this.cacheTree.privateKeys) {
      this.cacheTree.privateKeys = {}
    }
    this.updateCallback = updateCallback instanceof Function ? updateCallback : () => Promise.resolve()
    if (!secretBox) {
      console.warn('Please provide SecretBox to the KeyStore')
    }
  }

  async get({ alias }: { alias: string }): Promise<ManagedPrivateKey> {
    const privateKeyEntry = this.cacheTree.privateKeys[alias]
    if (!privateKeyEntry) throw Error('not_found: PrivateKey not found')
    if (this.secretBox && privateKeyEntry.privateKeyHex) {
      privateKeyEntry.privateKeyHex = await this.secretBox.decrypt(privateKeyEntry.privateKeyHex)
    }
    return structuredClone(privateKeyEntry)
  }

  async delete({ alias }: { alias: string }) {
    debug(`Deleting private key data for alias=${alias}`)
    const privateKeyEntry = this.cacheTree.privateKeys[alias]
    if (privateKeyEntry) {
      const oldTree = structuredClone(this.cacheTree)
      delete this.cacheTree.privateKeys[alias]
      const newTree = this.useDirectReferences ? this.cacheTree : structuredClone(this.cacheTree)
      await this.updateCallback(oldTree, newTree)
    }
    return true
  }

  async import(args: ImportablePrivateKey): Promise<ManagedPrivateKey> {
    debug('Saving private key data', args.alias)
    const key: ManagedPrivateKey = {
      alias: args.alias || uuid4(),
      privateKeyHex: args.privateKeyHex,
      type: args.type,
    }
    if (this.secretBox && key.privateKeyHex) {
      key.privateKeyHex = await this.secretBox.encrypt(key.privateKeyHex)
    }
    const existingKey = this.cacheTree.privateKeys[key.alias]
    if (existingKey && existingKey.privateKeyHex !== key.privateKeyHex) {
      throw new Error(
        `key_already_exists: A key with this alias exists but with different data. Please use a different alias.`,
      )
    }

    const oldTree = structuredClone(this.cacheTree)
    this.cacheTree.privateKeys[key.alias] = key
    const newTree = this.useDirectReferences ? this.cacheTree : structuredClone(this.cacheTree)
    await this.updateCallback(oldTree, newTree)

    return key
  }

  async list(): Promise<Array<ManagedPrivateKey>> {
    return structuredClone(Object.values(this.cacheTree.privateKeys))
  }
}
