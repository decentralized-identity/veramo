import EventEmitter from 'events'
import { OrPromise } from '@veramo/utils'
import { DataSource, In, Like } from 'typeorm'
import { KeyValueStoreEntity } from './entities/keyValueStoreEntity'
import { Options, Options_ } from './types'
import { KeyvStore, KeyvStoredData } from '../keyv-types'

export class KeyvTypeORMStoreAdapter extends EventEmitter implements KeyvStore<string> {
  private readonly dbConnection: OrPromise<DataSource>
  readonly namespace: string
  opts: Options_

  constructor(options: Options) {
    super()
    this.dbConnection = options.dbConnection
    this.namespace = options.namespace || 'keyv'
    this.opts = {
      validator: () => true,
      dialect: 'typeorm',
      ...options,
    }
  }

  async get(key: string | string[], options?: { raw?: boolean }): Promise<KeyvStoredData<string> | Array<KeyvStoredData<string>>> {
    if (Array.isArray(key)) {
      return this.getMany(key, options)
    }
    const connection = await getConnectedDb(this.dbConnection)
    const result = await connection.getRepository(KeyValueStoreEntity).findOneBy({
      key
    })
    return options?.raw !== true || !result ? result?.value : { value: result?.value, expires: result?.expires }
  }

  async getMany(keys: string[], options?: { raw?: boolean }): Promise<Array<KeyvStoredData<string>>> {
    const connection = await getConnectedDb(this.dbConnection)
    const results = await connection.getRepository(KeyValueStoreEntity).findBy({
      key: In(keys)
    })
    return results.filter(result => !!result.value).map(result => options?.raw || !result ? result?.value : {
      value: result?.value,
      expires: result?.expires,
    })
  }

  async set(key: string, value: string, ttl?: number): Promise<KeyvStoredData<string>> {
    const connection = await getConnectedDb(this.dbConnection)
    const entity = new KeyValueStoreEntity()
    entity.key = key
    entity.value = value
    entity.expires = ttl
    const result = await connection.getRepository(KeyValueStoreEntity).save(entity)
    return { value: value, expires: ttl }
  }

  async delete(key: string | string[]): Promise<boolean> {
    if (Array.isArray(key)) {
      return this.deleteMany(key)
    }
    const connection = await getConnectedDb(this.dbConnection)
    const result = await connection.getRepository(KeyValueStoreEntity).delete({  key })
    return result.affected === 1
  }

  async deleteMany(keys: string[]): Promise<boolean> {
    const connection = await getConnectedDb(this.dbConnection)
    const results = await connection.getRepository(KeyValueStoreEntity).delete({
      key: In(keys)
    })
    return !!results.affected && results.affected >= 1
  }

  async clear(): Promise<void> {
    const connection = await getConnectedDb(this.dbConnection)
    await connection.getRepository(KeyValueStoreEntity).delete({
      key: Like(`${this.namespace}:%`)
    })
  }

  async has(key: string): Promise<boolean> {
    const connection = await getConnectedDb(this.dbConnection)
    const result = await connection.getRepository(KeyValueStoreEntity).countBy({
      key
    })
    return result === 1
  }

  async disconnect(): Promise<void> {
    const connection = await getConnectedDb(this.dbConnection)
    await connection.destroy()
  }
}


/**
 *  Ensures that the provided DataSource is connected.
 *
 * @param dbConnection - a TypeORM DataSource or a Promise that resolves to a DataSource
 */
export async function getConnectedDb(dbConnection: OrPromise<DataSource>): Promise<DataSource> {
  if (dbConnection instanceof Promise) {
    return await dbConnection
  } else if (!dbConnection.isInitialized) {
    return await (<DataSource>dbConnection).initialize()
  } else {
    return dbConnection
  }
}
