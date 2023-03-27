import timekeeper from 'timekeeper'
import { Keyv } from '../keyv/keyv.js'
import { DataSource } from 'typeorm'
import { KeyValueStoreEntity } from '../store-adapters/typeorm/entities/keyValueStoreEntity.js'
import { KeyValueTypeORMStoreAdapter } from '../store-adapters'


describe('TypeORM Keyv Store adapter', () => {
  let dbConnection: DataSource

  beforeEach(async () => {
    dbConnection = await new DataSource({
      type: 'sqlite',
      database: ':memory:',
      logging: 'all',
      migrationsRun: false,
      synchronize: true,
      entities: [KeyValueStoreEntity],
    }).initialize()
  })

  afterEach(async () => {
    await (await dbConnection).destroy()
  })

  it('should respect ttl', async () => {
    const store = new KeyValueTypeORMStoreAdapter({ dbConnection, namespace: 'test' })
    const keyv = new Keyv(store)
    await keyv.set('key', 'value', 100)

    expect(await keyv.get('key')).toEqual('value')
    timekeeper.freeze(Date.now() + 150)
    expect(await keyv.get('key')).toBeUndefined()
  })

  it('should set a value that can be retrieved from the proper namespace', async () => {
    const store = new KeyValueTypeORMStoreAdapter({ dbConnection, namespace: 'test' })
    const keyv = new Keyv(store)
    await keyv.set('key', 'value')
    expect(await keyv.get('key')).toEqual('value')

    const alternateStore = new KeyValueTypeORMStoreAdapter({ dbConnection, namespace: 'another' })
    const alternateKeyv = new Keyv(alternateStore)
    expect(await alternateKeyv.get('key')).toBeUndefined()
  })

  it('should set multiple values that can be retrieved', async () => {
    const store = new KeyValueTypeORMStoreAdapter({ dbConnection, namespace: 'test' })
    const keyv = new Keyv(store)
    for (let i = 0; i < 10; i++) {
      await keyv.set(`${i}`, `value${i}`)
    }

    let values = await keyv.getMany(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'nope'])
    expect(values).toHaveLength(10)

    await keyv.delete('0')
    expect(await keyv.getMany([ '0'])).toHaveLength(0)
    values = await keyv.getMany(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'nope'])
    expect(values).toHaveLength(9)

    await keyv.clear()
    values = await keyv.getMany(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'nope'])
    expect(values).toHaveLength(0)
  })
})

