import { IIdentifier } from '@veramo/core'
import { AbstractDIDStore } from '@veramo/did-manager'

import Debug from 'debug'
import { DefaultRecords, DiffCallback } from '../types'
import structuredClone from '@ungap/structured-clone'

const debug = Debug('veramo:data-store-json:did-store')

export class DIDStoreJson extends AbstractDIDStore {
  private readonly cacheTree: Pick<DefaultRecords, 'dids' | 'keys'>
  private readonly updateCallback: DiffCallback
  private readonly useDirectReferences: boolean

  constructor(
    initialState: Pick<DefaultRecords, 'dids' | 'keys'>,
    updateCallback?: DiffCallback | null,
    useDirectReferences: boolean = true,
  ) {
    super()
    this.cacheTree = useDirectReferences ? initialState : structuredClone(initialState)
    this.updateCallback = updateCallback instanceof Function ? updateCallback : () => Promise.resolve()
    this.useDirectReferences = useDirectReferences
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
      throw Error('[veramo:data-store:identifier-store] Get requires did or (alias and provider)')
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

    return structuredClone(identifier)
  }

  async delete({ did }: { did: string }) {
    if (this.cacheTree.dids[did]) {
      const oldTree = structuredClone(this.cacheTree)
      delete this.cacheTree.dids[did]
      // FIXME: delete key associations?
      const newTree = this.useDirectReferences ? this.cacheTree : structuredClone(this.cacheTree)
      await this.updateCallback(oldTree, newTree)
      return true
    }
    return false
  }

  async import(args: IIdentifier) {
    const oldTree = structuredClone(this.cacheTree)
    this.cacheTree.dids[args.did] = args
    args.keys.forEach((key) => {
      this.cacheTree.keys[key.kid] = {
        ...key,
        // FIXME: keys should be able to associate with multiple DIDs
        meta: { ...key.meta, did: args.did },
      }
    })

    const newTree = this.useDirectReferences ? this.cacheTree : structuredClone(this.cacheTree)
    await this.updateCallback(oldTree, newTree)
    return true
  }

  async list(args: { alias?: string; provider?: string }): Promise<IIdentifier[]> {
    const result = Object.values(this.cacheTree.dids).filter(
      (iid: IIdentifier) =>
        (!args.provider || (args.provider && iid.provider === args.provider)) &&
        (!args.alias || (args.alias && iid.alias === args.alias)),
    )
    return structuredClone(result)
  }
}
