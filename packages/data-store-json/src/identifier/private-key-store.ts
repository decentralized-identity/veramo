import { AbstractSecretBox, AbstractPrivateKeyStore } from '@veramo/key-manager'
import { ImportablePrivateKey, ManagedPrivateKey } from '@veramo/key-manager/src/abstract-private-key-store'
import { v4 as uuid4 } from 'uuid'
import Debug from 'debug'
import { DiffCallback, VeramoJsonCache, VeramoJsonStore } from '../types'
import { serialize, deserialize } from '@ungap/structured-clone'

const debug = Debug('veramo:data-store-json:private-key-store')

/**
 * An implementation of {@link AbstractPrivateKeyStore} that uses a JSON object to store the private key material
 * needed by {@link @veramo/kms-local#KeyManagementSystem}.
 *
 * This class must be initialized with a {@link VeramoJsonStore}, which serves as the JSON object storing data in
 * memory as well as providing an update notification callback to persist this data.
 * The JSON object does not have to be shared with other users of {@link VeramoJsonStore}, but it can be.
 *
 * If an {@link AbstractSecretBox} is used, then key material is encrypted, even in memory.
 *
 * @beta This API is likely to change without a BREAKING CHANGE notice.
 */
export class PrivateKeyStoreJson extends AbstractPrivateKeyStore {
  private readonly cacheTree: Required<Pick<VeramoJsonCache, 'privateKeys'>>
  private readonly notifyUpdate: DiffCallback

  /**
   * @param jsonStore This serves as the JSON object storing data in memory as well as providing an update notification
   *   callback to persist this data. The JSON object does not have to be shared with other users of
   *   {@link VeramoJsonStore}, but it can be.
   * @param secretBox if this is used, then key material is encrypted, even in memory.
   */
  constructor(jsonStore: VeramoJsonStore, private secretBox?: AbstractSecretBox) {
    super()
    this.cacheTree = jsonStore as Required<Pick<VeramoJsonCache, 'privateKeys'>>
    this.notifyUpdate = jsonStore.notifyUpdate
    if (!this.cacheTree.privateKeys) {
      this.cacheTree.privateKeys = {}
    }
    if (!secretBox) {
      console.warn('Please provide SecretBox to the KeyStore')
    }
  }

  async get({ alias }: { alias: string }): Promise<ManagedPrivateKey> {
    const key = deserialize(serialize(this.cacheTree.privateKeys[alias]))
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
      const oldTree = deserialize(serialize(this.cacheTree, { lossy: true }))
      delete this.cacheTree.privateKeys[alias]
      await this.notifyUpdate(oldTree, this.cacheTree)
    }
    return true
  }

  async import(args: ImportablePrivateKey): Promise<ManagedPrivateKey> {
    debug('Saving private key data', args.alias)
    const alias = args.alias || uuid4()
    const key: ManagedPrivateKey = deserialize(serialize({
      ...args,
      alias,
    }))
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

    const oldTree = deserialize(serialize(this.cacheTree, { lossy: true }))
    this.cacheTree.privateKeys[key.alias] = key
    await this.notifyUpdate(oldTree, this.cacheTree)

    return key
  }

  async list(): Promise<Array<ManagedPrivateKey>> {
    return deserialize(serialize(Object.values(this.cacheTree.privateKeys)))
  }
}
