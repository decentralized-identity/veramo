import { IKey, ManagedKeyInfo } from '@veramo/core'
import { AbstractKeyStore } from '@veramo/key-manager'

import Debug from 'debug'
import { DiffCallback, VeramoJsonCache, VeramoJsonStore } from '../types'
import structuredClone from '@ungap/structured-clone'

const debug = Debug('veramo:data-store-json:key-store')

export class KeyStoreJson extends AbstractKeyStore {
  private readonly cacheTree: Required<Pick<VeramoJsonCache, 'keys'>>
  private readonly notifyUpdate: DiffCallback

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
      return structuredClone(this.cacheTree.keys[kid])
    } else {
      throw Error('not_found: Key not found')
    }
  }

  async delete({ kid }: { kid: string }) {
    if (this.cacheTree.keys[kid]) {
      const oldTree = structuredClone(this.cacheTree, { lossy: true })
      delete this.cacheTree.keys[kid]
      await this.notifyUpdate(oldTree, this.cacheTree)
      return true
    } else {
      return false
    }
  }

  async import(args: IKey) {
    const oldTree = structuredClone(this.cacheTree, { lossy: true })
    this.cacheTree.keys[args.kid] = args
    await this.notifyUpdate(oldTree, this.cacheTree)
    return true
  }

  async list(args: {} = {}): Promise<ManagedKeyInfo[]> {
    const keys = Object.values(this.cacheTree.keys).map((key: IKey) => {
      const { kid, publicKeyHex, type, meta, kms } = key
      return { kid, publicKeyHex, type, meta: structuredClone(meta), kms } as ManagedKeyInfo
    })
    return keys
  }
}
