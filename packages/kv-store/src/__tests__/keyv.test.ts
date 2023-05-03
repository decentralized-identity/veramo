import KeyvSqlite from '@keyv/sqlite'

import timekeeper from 'timekeeper'
import { Keyv } from '../keyv/keyv.js'
import { DataSource } from 'typeorm'
import { KeyValueStoreEntity } from '../store-adapters/typeorm/entities/keyValueStoreEntity.js'
import { KeyValueTieredStoreAdapter, KeyValueTypeORMStoreAdapter } from '../store-adapters/index.js'
import { KeyvOptions } from '../keyv/keyv-types.js'
import { kvStoreMigrations } from '../store-adapters/typeorm/migrations'

let dbConnection: DataSource
beforeEach(async () => {
  dbConnection = await new DataSource({
    type: 'sqlite',
    database: ':memory:',
    logging: ['error'],
    migrationsRun: true,
    synchronize: false,
    migrations: [...kvStoreMigrations],
    entities: [KeyValueStoreEntity],
  }).initialize()
})
afterEach(async () => {
  try {
    if (dbConnection?.isInitialized) {
      await (await dbConnection).destroy()
    }
  } catch (error) {
    // the disconnect test will close the DB anyway
  }
})
describe('keyv MAP store', () => {
  it('should respect ttl', async () => {
    const store = new Map<string, string>()
    const keyv = new Keyv<string>(store)
    await keyv.set('key', 'value', 100)

    expect(await keyv.get('key')).toEqual('value')
    timekeeper.freeze(Date.now() + 150)
    expect(await keyv.get('key')).toBeUndefined()
  })
  it('should work for all methods', async () => {
    const store = new Map<string, string>()
    await testAllKeyvMethods(store)
  })
})

describe('keyv sqlite store', () => {
  it('should respect ttl', async () => {
    const keyv = new Keyv<string>(new KeyvSqlite<string>())
    await keyv.set('key', 'value', 100)

    expect(await keyv.get('key')).toEqual('value')
    timekeeper.freeze(Date.now() + 150)
    expect(await keyv.get('key')).toBeUndefined()
  })
  it('should work for all methods', async () => {
    const store = new KeyvSqlite<string>()
    await testAllKeyvMethods(store)
  })
})

describe('keyv TypeORM store', () => {
  it('should respect ttl', async () => {
    const store = new KeyValueTypeORMStoreAdapter({ dbConnection, namespace: 'test' })
    const keyv = new Keyv<string>(store)
    await keyv.set('key', 'value', 100)

    expect(await keyv.get('key')).toEqual('value')
    timekeeper.freeze(Date.now() + 150)
    expect(await keyv.get('key')).toBeUndefined()
  })

  it('should set a value that can be retrieved from the proper namespace', async () => {
    const store = new KeyValueTypeORMStoreAdapter({ dbConnection, namespace: 'test' })
    const keyv = new Keyv<string>(store)
    await keyv.set('key', 'value')
    expect(await keyv.get('key')).toEqual('value')

    const alternateStore = new KeyValueTypeORMStoreAdapter({ dbConnection, namespace: 'another' })
    const alternateKeyv = new Keyv<string>(alternateStore)
    expect(await alternateKeyv.get('key')).toBeUndefined()
  })

  it('should set multiple values that can be retrieved', async () => {
    const store = new KeyValueTypeORMStoreAdapter({ dbConnection, namespace: 'test' })
    const keyv = new Keyv<string>(store)
    for (let i = 0; i < 10; i++) {
      await keyv.set(`${i}`, `value${i}`)
    }

    let values = await keyv.getMany(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'nope'])
    expect(values).toHaveLength(11)

    await keyv.delete('0')
    expect(await keyv.getMany(['0'])).toHaveLength(1)
    values = await keyv.getMany(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'nope'])
    expect(values).toHaveLength(11)
    expect(values[9]).toBe('value9')
    expect(values[10]).toBeUndefined()

    await keyv.clear()
    values = await keyv.getMany(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'nope'])
    expect(values).toHaveLength(11)
    expect(values[0]).toBeUndefined()
    expect(values[9]).toBeUndefined()
    expect(values[10]).toBeUndefined()
  })
  it('should work for all methods', async () => {
    const store = new KeyValueTypeORMStoreAdapter({ dbConnection, namespace: 'test-all' })
    await testAllKeyvMethods(store)
    await store.disconnect()
  })
})

describe('keyv tiered store', () => {
  it('should respect ttl', async () => {
    const local: Map<string, string> = new Map()
    const remote = new KeyValueTypeORMStoreAdapter({ dbConnection })

    const options: KeyvOptions<string> = {
      namespace: 'example',
      store: new KeyValueTieredStoreAdapter({ local, remote }),
    }
    const keyv = new Keyv<string>(undefined, options)
    await keyv.set('key', 'value', 100)

    expect(await keyv.get('key')).toEqual('value')
    timekeeper.freeze(Date.now() + 150)
    expect(await keyv.get('key')).toBeUndefined()
    await keyv.disconnect()
  })
  it('should work for all methods', async () => {
    const local: Map<string, string> = new Map()
    const remote = new KeyValueTypeORMStoreAdapter({ dbConnection })

    const options: KeyvOptions<string> = {
      namespace: 'example',
      store: new KeyValueTieredStoreAdapter({ local, remote }),
    }
    const store = new Keyv<string>(undefined, options)

    // No raw match test, as remote and local have different raw values
    await testAllKeyvMethods(store, false)
  })
})

async function testAllKeyvMethods(store: any, rawMatchTest = true) {
  const keyv = new Keyv<string>(store)

  // set value
  await expect(keyv.set('key1', 'value1')).resolves.toEqual(true)
  await expect(keyv.set('key2', 'value2')).resolves.toEqual(true)

  // get value by key
  await expect(keyv.get('key1', { raw: false })).resolves.toEqual('value1')
  await expect(keyv.get('key1', { raw: true })).resolves.toMatchObject({ value: 'value1' })

  // get value by non-existing key
  await expect(keyv.get('key3', { raw: false })).resolves.toBeUndefined()
  await expect(keyv.get('key3', { raw: true })).resolves.toBeUndefined()

  // Get many as non-raw and raw
  await expect(keyv.getMany(['key1', 'key2'], { raw: false })).resolves.toMatchObject(['value1', 'value2'])
  if (rawMatchTest) {
    await expect(keyv.getMany(['key1', 'key2'], { raw: true })).resolves.toMatchObject([
      { value: 'value1' },
      { value: 'value2' },
    ])
  }

  // Check existence
  await expect(keyv.has('key1')).resolves.toEqual(true)
  await expect(keyv.has('key3')).resolves.toEqual(false)

  // delete key1 only
  await expect(keyv.delete('key1')).resolves.toEqual(true)
  await expect(keyv.has('key1')).resolves.toEqual(false)
  await expect(keyv.has('key2')).resolves.toEqual(true)

  // clear
  await keyv.clear()
  await expect(keyv.has('key2')).resolves.toEqual(false)
}
