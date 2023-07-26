import { KeyValueStore } from '../key-value-store.js'
import { IKeyValueStore } from '../key-value-types.js'

interface TestValue {
  stringProp: string
  numberProp: number
  objectProp: {
    value: string | number
  }
}

let testValues: TestValue[] = []

for (let i = 0; i < 10; i++) {
  testValues.push({
    stringProp: `stringValue${i}`,
    numberProp: i,
    objectProp: {
      value: `objectValue${i}`,
    },
  })
}
describe('kvStore with MAP adapter', () => {
  let kvStore: IKeyValueStore<TestValue>
  beforeEach(async () => {
    const store = new Map<string, TestValue>()
    kvStore = new KeyValueStore({ store })
    for (let i = 0; i < 10; i++) {
      await kvStore.set(`key${i}`, testValues[i])
    }
  })
  afterEach(async () => {
    try {
      await kvStore.clear()
      await kvStore.disconnect()
    } catch (error) {}
  })
  it('should get non-existing keys as undefined', async () => {
    await expect(kvStore.get('nope')).resolves.toBeUndefined()
    await expect(kvStore.getAsValueData('nope')).resolves.toMatchObject({
      value: undefined,
      expires: undefined,
    })
  })

  it('should get single results', async () => {
    for (let i = 0; i < 10; i++) {
      await expect(kvStore.get(`key${i}`)).resolves.toEqual(testValues[i])
      await expect(kvStore.getAsValueData(`key${i}`)).resolves.toMatchObject({
        value: testValues[i],
      })
    }
  })

  it('should get multiple results', async () => {
    // Let's get multiple results
    const manyResult = await kvStore.getMany(['key1', 'nope', 'key4'])
    expect(manyResult).toHaveLength(3)
    expect(manyResult[0]).toEqual(testValues[1])
    expect(manyResult[1]).toBeUndefined()
    expect(manyResult[2]).toEqual(testValues[4])
    const manyValueResult = await kvStore.getManyAsValueData(['key1', 'nope', 'key4'])
    expect(manyValueResult).toHaveLength(3)
    expect(manyValueResult[0]).toEqual({ value: testValues[1], expires: undefined })
    expect(manyValueResult[1]).toEqual({ value: undefined, expires: undefined })
    expect(manyValueResult[2]).toEqual({ value: testValues[4], expires: undefined })
  })

  it('should check existence of keys', async () => {
    await expect(kvStore.has(`key1`)).resolves.toEqual(true)
    await expect(kvStore.has(`nope`)).resolves.toEqual(false)
  })

  it('should delete an existing key', async () => {
    await expect(kvStore.has(`key1`)).resolves.toEqual(true)
    await expect(kvStore.delete(`key1`)).resolves.toEqual(true)
    await expect(kvStore.has(`key1`)).resolves.toEqual(false)
  })

  it('should not throw an error when deleting a non-existing key', async () => {
    await expect(kvStore.delete(`nope`)).resolves.toEqual(false)
  })

  it('should delete multiple values', async () => {
    await expect(kvStore.deleteMany(['key2', 'nope', 'key6'])).resolves.toEqual([true, false, true])
  })

  it('should clear all', async () => {
    await kvStore.clear()
    await expect(kvStore.has(`key1`)).resolves.toEqual(false)
  })
})
