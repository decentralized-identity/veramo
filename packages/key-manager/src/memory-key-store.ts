import { IKey } from '@veramo/core-types'
import { AbstractKeyStore } from './abstract-key-store.js'
import {
  AbstractPrivateKeyStore,
  ImportablePrivateKey,
  ManagedPrivateKey,
} from './abstract-private-key-store.js'
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

  async getKey({ kid }: { kid: string }): Promise<IKey> {
    const key = this.keys[kid]
    if (!key) throw Error('Key not found')
    return key
  }

  async deleteKey({ kid }: { kid: string }) {
    delete this.keys[kid]
    return true
  }

  async importKey(args: IKey) {
    this.keys[args.kid] = { ...args }
    return true
  }

  async listKeys(args: {}): Promise<Exclude<IKey, 'privateKeyHex'>[]> {
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

  async getKey({ alias }: { alias: string }): Promise<ManagedPrivateKey> {
    const key = this.privateKeys[alias]
    if (!key) throw Error(`not_found: PrivateKey not found for alias=${alias}`)
    return key
  }

  async deleteKey({ alias }: { alias: string }) {
    delete this.privateKeys[alias]
    return true
  }

  async importKey(args: ImportablePrivateKey) {
    const alias = args.alias || uuidv4()
    const existingEntry = this.privateKeys[alias]
    if (existingEntry && existingEntry.privateKeyHex !== args.privateKeyHex) {
      throw new Error('key_already_exists: key exists with different data, please use a different alias')
    }
    this.privateKeys[alias] = { ...args, alias }
    return this.privateKeys[alias]
  }

  async listKeys(): Promise<Array<ManagedPrivateKey>> {
    return [...Object.values(this.privateKeys)]
  }
}
