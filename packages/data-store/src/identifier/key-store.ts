import { IKey, ManagedKeyInfo } from '@veramo/core-types'
import { AbstractKeyStore } from '@veramo/key-manager'
import { DataSource } from 'typeorm'

import { Key } from '../entities/key.js'

import Debug from 'debug'
import { OrPromise } from "@veramo/utils";
import { getConnectedDb } from "../utils.js";
const debug = Debug('veramo:typeorm:key-store')

/**
 * An implementation of {@link @veramo/key-manager#AbstractKeyStore | AbstractKeyStore} that uses a TypeORM database to
 * store the relationships between keys, their IDs, aliases and
 * {@link @veramo/key-manager#AbstractKeyManagementSystem | KMS implementations}, as they are known and managed by a
 * Veramo agent.
 *
 * An instance of this class can be used by {@link @veramo/key-manager#KeyManager} as the data storage layer.
 *
 * To make full use of this class, it should use the same database as the one used by
 * {@link @veramo/data-store#DIDStore | DIDStore}.
 *
 * @public
 */
export class KeyStore extends AbstractKeyStore {
  constructor(private dbConnection: OrPromise<DataSource>) {
    super()
  }

  async getKey({ kid }: { kid: string }): Promise<IKey> {
    const key = await (await getConnectedDb(this.dbConnection)).getRepository(Key).findOneBy({ kid })
    if (!key) throw Error('Key not found')
    return key as IKey
  }

  async deleteKey({ kid }: { kid: string }) {
    const key = await (await getConnectedDb(this.dbConnection)).getRepository(Key).findOneBy({ kid })
    if (!key) throw Error('Key not found')
    debug('Deleting key', kid)
    await (await getConnectedDb(this.dbConnection)).getRepository(Key).remove(key)
    return true
  }

  async importKey(args: IKey) {
    const key = new Key()
    key.kid = args.kid
    key.publicKeyHex = args.publicKeyHex
    key.type = args.type
    key.kms = args.kms
    key.meta = args.meta
    debug('Saving key', args.kid)
    await (await getConnectedDb(this.dbConnection)).getRepository(Key).save(key)
    return true
  }

  async listKeys(args: {} = {}): Promise<ManagedKeyInfo[]> {
    const keys = await (await getConnectedDb(this.dbConnection)).getRepository(Key).find()
    const managedKeys: ManagedKeyInfo[] = keys.map((key) => {
      const { kid, publicKeyHex, type, meta, kms } = key
      return { kid, publicKeyHex, type, meta, kms } as IKey
    })
    return managedKeys
  }
}
