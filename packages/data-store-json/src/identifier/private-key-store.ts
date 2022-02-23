import { AbstractSecretBox, AbstractPrivateKeyStore } from '@veramo/key-manager'
import { ImportablePrivateKey, ManagedPrivateKey } from '@veramo/key-manager/src/abstract-private-key-store'
import { v4 as uuid4 } from 'uuid'
import Debug from 'debug'
import { DiffCallback, VeramoJsonCache } from '../types'
import structuredClone from '@ungap/structured-clone'

const debug = Debug('veramo:data-store-json:private-key-store')

export class PrivateKeyStoreJson extends AbstractPrivateKeyStore {
  private readonly cacheTree: Required<Pick<VeramoJsonCache, 'privateKeys'>>

  constructor(
    jsonCache: VeramoJsonCache,
    private secretBox?: AbstractSecretBox,
    private updateCallback: DiffCallback = () => Promise.resolve()
  ) {
    super()
    this.cacheTree = jsonCache as Required<Pick<VeramoJsonCache, 'privateKeys'>>
    if (!this.cacheTree.privateKeys) {
      this.cacheTree.privateKeys = {}
    }
    if (!secretBox) {
      console.warn('Please provide SecretBox to the KeyStore')
    }
  }

  async get({ alias }: { alias: string }): Promise<ManagedPrivateKey> {
    const key = structuredClone(this.cacheTree.privateKeys[alias])
    if (!key) throw Error('not_found: PrivateKey not found')
    if (this.secretBox && key.privateKeyHex) {
      key.privateKeyHex = await this.secretBox.decrypt(key.privateKeyHex)
    }
    return key
  }

  async delete({ alias }: { alias: string }) {
    debug(`Deleting private key data for alias=${alias}`)
    const privateKeyEntry = this.cacheTree.privateKeys[alias]
    if (privateKeyEntry) {
      const oldTree = structuredClone(this.cacheTree)
      delete this.cacheTree.privateKeys[alias]
      await this.updateCallback(oldTree, this.cacheTree)
    }
    return true
  }

  async import(args: ImportablePrivateKey): Promise<ManagedPrivateKey> {
    debug('Saving private key data', args.alias)
    const alias = args.alias || uuid4()
    const key: ManagedPrivateKey = structuredClone({
      ...args,
      alias
    })
    if (this.secretBox && key.privateKeyHex) {
      const copy = key.privateKeyHex
      key.privateKeyHex = await this.secretBox.encrypt(copy)
    }
    const existingKey = this.cacheTree.privateKeys[key.alias]
    if (existingKey && existingKey.privateKeyHex !== key.privateKeyHex) {
      throw new Error(
        `key_already_exists: A key with this alias exists but with different data. Please use a different alias.`,
      )
    }

    const oldTree = structuredClone(this.cacheTree)
    this.cacheTree.privateKeys[key.alias] = key
    await this.updateCallback(oldTree, this.cacheTree)

    return key
  }

  async list(): Promise<Array<ManagedPrivateKey>> {
    return structuredClone(Object.values(this.cacheTree.privateKeys))
  }
}
