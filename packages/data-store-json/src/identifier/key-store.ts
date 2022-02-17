import { IKey, ManagedKeyInfo } from '@veramo/core'
import { AbstractKeyStore, AbstractSecretBox } from '@veramo/key-manager'
import { Connection } from 'typeorm'

import Debug from 'debug'
import { DefaultRecords, DiffCallback } from '../types'
import structuredClone from '@ungap/structured-clone'

const debug = Debug('veramo:typeorm:key-store')

export class KeyStoreJson extends AbstractKeyStore {
  private readonly cacheTree: Pick<DefaultRecords, 'keys'>
  private readonly updateCallback: DiffCallback
  private readonly useDirectReferences: boolean

  constructor(
    initialState: Pick<DefaultRecords, 'keys'>,
    updateCallback?: DiffCallback | null,
    useDirectReferences: boolean = true,
  ) {
    super()
    this.cacheTree = useDirectReferences ? initialState : structuredClone(initialState)
    this.updateCallback = updateCallback instanceof Function ? updateCallback : () => Promise.resolve()
    this.useDirectReferences = useDirectReferences
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
      const oldTree = structuredClone(this.cacheTree)
      delete this.cacheTree.keys[kid]
      const newTree = this.useDirectReferences ? this.cacheTree : structuredClone(this.cacheTree)
      await this.updateCallback(oldTree, newTree)
      return true
    } else {
      return false
    }
  }

  async import(args: IKey) {
    const oldTree = structuredClone(this.cacheTree)
    this.cacheTree.keys[args.kid] = args
    const newTree = this.useDirectReferences ? this.cacheTree : structuredClone(this.cacheTree)
    await this.updateCallback(oldTree, newTree)
    return true
  }

  async list(args: {} = {}): Promise<ManagedKeyInfo[]> {
    const keys = Object.values(this.cacheTree.keys).map((key: IKey) => {
      const { kid, publicKeyHex, type, meta, kms, ...rest } = key
      return { kid, publicKeyHex, type, meta: structuredClone(meta), kms } as ManagedKeyInfo
    })
    return keys
  }
}
//
// export class PrivateKeyStoreJson extends AbstractKeyStore {
//   private readonly cacheTree: Pick<DefaultRecords, 'private-keys'>
//   private readonly updateCallback: DiffCallback
//   private readonly useDirectReferences: boolean
//
//   constructor(initialState: Pick<DefaultRecords, 'private-keys'>, updateCallback?: DiffCallback | null, useDirectReferences: boolean = true, secretBox?: AbstractSecretBox) {
//     super()
//     if (!secretBox) {
//       console.warn('Please provide SecretBox to the KeyStore')
//     }
//     this.cacheTree = useDirectReferences ? initialState : structuredClone(initialState)
//     this.updateCallback = (updateCallback instanceof Function) ? updateCallback : () => Promise.resolve()
//     this.useDirectReferences = useDirectReferences
//   }
//
//   async get({ kid }: { kid: string }): Promise<IKey> {
//     if (this.cacheTree.keys[kid]) {
//       return structuredClone(this.cacheTree.keys[kid])
//     } else {
//       throw Error('not_found: Key not found')
//     }
//   }
//
//   async delete({ kid }: { kid: string }) {
//     if (this.cacheTree.keys[kid]) {
//       const oldTree = structuredClone(this.cacheTree)
//       delete this.cacheTree.keys[kid]
//       const newTree = this.useDirectReferences ? this.cacheTree : structuredClone(this.cacheTree)
//       await this.updateCallback(oldTree, newTree)
//       return true
//     } else {
//       return false
//     }
//   }
//
//   async import(args: IKey) {
//     const oldTree = structuredClone(this.cacheTree)
//     this.cacheTree.keys[args.kid] = args
//     const newTree = this.useDirectReferences ? this.cacheTree : structuredClone(this.cacheTree)
//     await this.updateCallback(oldTree, newTree)
//     return true
//   }
//
//   async list(args: {} = {}): Promise<ManagedKeyInfo[]> {
//     const keys = Object.values(this.cacheTree.keys).map((key: IKey) => {
//       const { kid, publicKeyHex, type, meta, kms, ...rest } = key
//       return { kid, publicKeyHex, type, meta: structuredClone(meta), kms } as ManagedKeyInfo
//     })
//     return keys
//   }
// }
