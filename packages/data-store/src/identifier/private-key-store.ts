import {
  AbstractPrivateKeyStore,
  AbstractSecretBox,
  ImportablePrivateKey,
  ManagedPrivateKey,
} from '@veramo/key-manager'
import { DataSource } from 'typeorm'
import { PrivateKey } from '../entities/private-key.js'
import { v4 as uuid4 } from 'uuid'
import Debug from 'debug'
import { OrPromise } from '@veramo/utils'
import { getConnectedDb } from '../utils.js'

const debug = Debug('veramo:typeorm:key-store')

/**
 * An implementation of {@link @veramo/key-manager#AbstractPrivateKeyStore | AbstractPrivateKeyStore} that uses a
 * TypeORM database connection to store private key material.
 *
 * The keys can be encrypted while at rest if this class is initialized with an
 * {@link @veramo/key-manager#AbstractSecretBox | AbstractSecretBox} implementation.
 *
 * @public
 */
export class PrivateKeyStore extends AbstractPrivateKeyStore {
  constructor(private dbConnection: OrPromise<DataSource>, private secretBox?: AbstractSecretBox) {
    super()
    if (!secretBox) {
      console.warn('Please provide SecretBox to the KeyStore')
    }
  }

  async getKey({ alias }: { alias: string }): Promise<ManagedPrivateKey> {
    const key = await (await getConnectedDb(this.dbConnection)).getRepository(PrivateKey).findOneBy({ alias })
    if (!key) throw Error('Key not found')
    if (this.secretBox && key.privateKeyHex) {
      key.privateKeyHex = await this.secretBox.decrypt(key.privateKeyHex)
    }
    return key as ManagedPrivateKey
  }

  async deleteKey({ alias }: { alias: string }) {
    const key = await (await getConnectedDb(this.dbConnection)).getRepository(PrivateKey).findOneBy({ alias })
    if (!key) throw Error(`not_found: Private Key data not found for alias=${alias}`)
    debug('Deleting private key data', alias)
    await (await getConnectedDb(this.dbConnection)).getRepository(PrivateKey).remove(key)
    return true
  }

  async importKey(args: ImportablePrivateKey): Promise<ManagedPrivateKey> {
    const key = new PrivateKey()
    key.alias = args.alias || uuid4()
    key.privateKeyHex = args.privateKeyHex
    key.type = args.type
    debug('Saving private key data', args.alias)
    const keyRepo = await (await getConnectedDb(this.dbConnection)).getRepository(PrivateKey)
    const existingKey = await keyRepo.findOneBy({ alias: key.alias })
    if (existingKey && this.secretBox) {
      existingKey.privateKeyHex = await this.secretBox.decrypt(existingKey.privateKeyHex)
    }
    if (existingKey && existingKey.privateKeyHex !== key.privateKeyHex) {
      throw new Error(
        `key_already_exists: A key with this alias exists but with different data. Please use a different alias.`,
      )
    }
    if (this.secretBox && key.privateKeyHex) {
      key.privateKeyHex = await this.secretBox.encrypt(key.privateKeyHex)
    }
    await keyRepo.save(key)
    return key
  }

  async listKeys(): Promise<Array<ManagedPrivateKey>> {
    let keys = await (await getConnectedDb(this.dbConnection)).getRepository(PrivateKey).find()
    if (this.secretBox) {
      for (const key of keys) {
        key.privateKeyHex = await this.secretBox?.decrypt(key.privateKeyHex) as string
      }
    }
    return keys
  }
}
