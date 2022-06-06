import { IIdentifier } from '@veramo/core'
import { AbstractDIDStore } from '@veramo/did-manager'

import Debug from 'debug'
import { DiffCallback, VeramoJsonCache, VeramoJsonStore } from '../types'
import { serialize, deserialize } from '@ungap/structured-clone'

const debug = Debug('veramo:data-store-json:did-store')

/**
 * An implementation of {@link @veramo/did-manager#AbstractDIDStore | AbstractDIDStore} that uses a JSON object to
 * store the relationships between DIDs, their providers and controllers and their keys and services as they are known
 * and managed by a Veramo agent.
 *
 * An instance of this class can be used by {@link @veramo/did-manager#DIDManager} as the data storage layer.
 *
 * This class must be initialized with a {@link VeramoJsonStore}, which serves as the JSON object storing data in
 * memory as well as providing an update notification callback to persist this data.
 * For correct usage, this MUST use the same {@link VeramoJsonStore} instance as the one used by
 * {@link @veramo/key-manager#KeyManager | KeyManager}.
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export class DIDStoreJson extends AbstractDIDStore {
  private readonly cacheTree: Required<Pick<VeramoJsonCache, 'dids' | 'keys'>>
  private readonly notifyUpdate: DiffCallback

  constructor(jsonStore: VeramoJsonStore) {
    super()
    this.notifyUpdate = jsonStore.notifyUpdate
    this.cacheTree = jsonStore as Required<Pick<VeramoJsonCache, 'dids' | 'keys'>>
    if (!this.cacheTree.dids) {
      this.cacheTree.dids = {}
    }
    if (!this.cacheTree.keys) {
      this.cacheTree.keys = {}
    }
  }

  async get({
              did,
              alias,
              provider,
            }: {
    did?: string
    alias?: string
    provider?: string
  }): Promise<IIdentifier> {
    let where: { did?: string; alias?: string; provider?: string } = {}

    if (did !== undefined && alias === undefined) {
      where = { did }
    } else if (did === undefined && alias !== undefined && provider !== undefined) {
      where = { alias, provider }
    } else {
      throw Error('invalid_arguments: DidStoreJson.get requires did or (alias and provider)')
    }

    let identifier: IIdentifier | undefined
    if (where.did) {
      identifier = this.cacheTree.dids[where.did]
    } else {
      identifier = Object.values(this.cacheTree.dids).find(
        (iid: IIdentifier) => iid.provider === where.provider && iid.alias === where.alias,
      )
    }

    if (!identifier) throw Error('Identifier not found')

    return deserialize(serialize(identifier))
  }

  async delete({ did }: { did: string }) {
    if (this.cacheTree.dids[did]) {
      const oldTree = deserialize(serialize(this.cacheTree, { lossy: true }))
      delete this.cacheTree.dids[did]
      // FIXME: delete key associations?
      await this.notifyUpdate(oldTree, this.cacheTree)
      return true
    }
    return false
  }

  async import(args: IIdentifier) {
    const oldTree = deserialize(serialize(this.cacheTree, { lossy: true }))
    this.cacheTree.dids[args.did] = args
    args.keys.forEach((key) => {
      this.cacheTree.keys[key.kid] = {
        ...key,
        // FIXME: keys should be able to associate with multiple DIDs
        meta: { ...key.meta, did: args.did },
      }
    })

    await this.notifyUpdate(oldTree, this.cacheTree)
    return true
  }

  async list(args: { alias?: string; provider?: string }): Promise<IIdentifier[]> {
    const result = Object.values(this.cacheTree.dids).filter(
      (iid: IIdentifier) =>
        (!args.provider || (args.provider && iid.provider === args.provider)) &&
        (!args.alias || (args.alias && iid.alias === args.alias)),
    )
    return deserialize(serialize(result))
  }
}
