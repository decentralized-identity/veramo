import { IKey, ManagedKeyInfo } from '@veramo/core'
import { AbstractKeyStore } from '@veramo/key-manager'

import Debug from 'debug'
import { DiffCallback, VeramoJsonCache, VeramoJsonStore } from '../types'
import { serialize, deserialize } from '@ungap/structured-clone'

const debug = Debug('veramo:data-store-json:key-store')

/**
 * An implementation of {@link @veramo/key-manager#AbstractKeyStore | AbstractKeyStore} that uses a JSON object to
 * store the relationships between keys, their IDs, aliases and
 * {@link @veramo/key-manager#AbstractKeyManagementSystem | KMS implementations}, as they are known and managed by a
 * Veramo agent.
 *
 * An instance of this class can be used by {@link @veramo/key-manager#KeyManager} as the data storage layer.
 *
 * This class must be initialized with a {@link VeramoJsonStore}, which serves as the JSON object storing data in
 * memory as well as providing an update notification callback to persist this data.
 * For correct usage, this MUST use the same {@link VeramoJsonStore} instance as the one used by
 * {@link @veramo/did-manager#DIDManager | DIDManager}.
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export class KeyStoreJson extends AbstractKeyStore {
  private readonly cacheTree: Required<Pick<VeramoJsonCache, 'keys'>>
  private readonly notifyUpdate: DiffCallback

  /**
   * @param jsonStore - Serves as the JSON object storing data in memory as well as providing an update notification
   *   callback to persist this data. For correct usage, this MUST use the same {@link VeramoJsonStore} instance as the
   *   one used by {@link @veramo/did-manager#DIDManager | DIDManager}.
   */
  constructor(jsonStore: VeramoJsonStore) {
    super()
    this.notifyUpdate = jsonStore.notifyUpdate
    this.cacheTree = jsonStore as Required<Pick<VeramoJsonCache, 'dids' | 'keys'>>
    if (!this.cacheTree.keys) {
      this.cacheTree.keys = {}
    }
  }

  async get({ kid }: { kid: string }): Promise<IKey> {
    if (this.cacheTree.keys[kid]) {
      return deserialize(serialize(this.cacheTree.keys[kid]))
    } else {
      throw Error('not_found: Key not found')
    }
  }

  async delete({ kid }: { kid: string }) {
    if (this.cacheTree.keys[kid]) {
      const oldTree = deserialize(serialize(this.cacheTree, { lossy: true }))
      delete this.cacheTree.keys[kid]
      await this.notifyUpdate(oldTree, this.cacheTree)
      return true
    } else {
      return false
    }
  }

  async import(args: IKey) {
    const oldTree = deserialize(serialize(this.cacheTree, { lossy: true }))
    this.cacheTree.keys[args.kid] = args
    await this.notifyUpdate(oldTree, this.cacheTree)
    return true
  }

  async list(args: {} = {}): Promise<ManagedKeyInfo[]> {
    const keys = Object.values(this.cacheTree.keys).map((key: IKey) => {
      const { kid, publicKeyHex, type, meta, kms } = key
      return { kid, publicKeyHex, type, meta: deserialize(serialize(meta)), kms } as ManagedKeyInfo
    })
    return keys
  }
}
