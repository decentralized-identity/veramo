import { IKey } from '@veramo/core'
import { AbstractKeyStore } from './abstract-key-store'
import {
  AbstractPrivateKeyStore,
  ImportablePrivateKey,
  ManagedPrivateKey,
} from './abstract-private-key-store'
import { v4 as uuidv4 } from 'uuid'

/**
 * An implementation of {@link AbstractKeyStore} that holds everything in memory.
 *
 * This is usable by {@link @veramo/key-manager#KeyManager | KeyManager} to hold the key metadata and relationship to
 * the KMS implementation.
 *
 * @public
 */
export class MemoryKeyStore extends AbstractKeyStore {
  private keys: Record<string, IKey> = {}

  async get({ kid }: { kid: string }): Promise<IKey> {
    const key = this.keys[kid]
    if (!key) throw Error('Key not found')
    return key
  }

  async delete({ kid }: { kid: string }) {
    delete this.keys[kid]
    return true
  }

  async import(args: IKey) {
    this.keys[args.kid] = { ...args }
    return true
  }

  async list(args: {}): Promise<Exclude<IKey, 'privateKeyHex'>[]> {
    const safeKeys = Object.values(this.keys).map((key) => {
      const { privateKeyHex, ...safeKey } = key
      return safeKey
    })
    return safeKeys
  }
}

/**
 * An implementation of {@link AbstractPrivateKeyStore} that holds everything in memory.
 *
 * This is usable by {@link @veramo/kms-local#KeyManagementSystem} to hold the private key data.
 *
 * @public
 */
export class MemoryPrivateKeyStore extends AbstractPrivateKeyStore {
  private privateKeys: Record<string, ManagedPrivateKey> = {}

  async get({ alias }: { alias: string }): Promise<ManagedPrivateKey> {
    const key = this.privateKeys[alias]
    if (!key) throw Error(`not_found: PrivateKey not found for alias=${alias}`)
    return key
  }

  async delete({ alias }: { alias: string }) {
    delete this.privateKeys[alias]
    return true
  }

  async import(args: ImportablePrivateKey) {
    const alias = args.alias || uuidv4()
    const existingEntry = this.privateKeys[alias]
    if (existingEntry && existingEntry.privateKeyHex !== args.privateKeyHex) {
      throw new Error('key_already_exists: key exists with different data, please use a different alias')
    }
    this.privateKeys[alias] = { ...args, alias }
    return this.privateKeys[alias]
  }

  async list(): Promise<Array<ManagedPrivateKey>> {
    return [...Object.values(this.privateKeys)]
  }
}
