import { DataManager } from '../agent/dataManager'
import { AbstractDataStore } from '../data-store/abstractDataStore'
import { MemoryDataStore } from '../data-store/memoryDataStore'

describe('DataManager', () => {
  const stores: Record<string, AbstractDataStore> = {}
  let dataManager: DataManager

  beforeAll(() => {
    stores['memory1'] = new MemoryDataStore()
    stores['memory2'] = new MemoryDataStore()
    dataManager = new DataManager({ store: stores })
  })
  beforeEach(async () => {
    await dataManager.clear({})
  })
  describe('MemoryDataManager', () => {
    it('should store object', async () => {
      const data = { test: 'test' }
      const res = await dataManager.save({
        data,
        options: { store: 'memory1' },
      })

      const allData = await dataManager.query({})
      expect(allData).toHaveLength(1)
      expect(allData[0].metadata.id).toEqual(res[0].id)
      expect(res[0].store).toEqual('memory1')
      expect(allData[0].data).toEqual(data)
      expect(allData[0].metadata.store).toEqual('memory1')
      expect.assertions(5)
    })
    it('should store object without options object', async () => {
      const data = { test: 'test' }
      const res = await dataManager.save({
        data,
      })

      const allData = await dataManager.query({})
      expect(allData).toHaveLength(2)
      expect(allData[0].metadata.id).toEqual(res[0].id)
      expect(res[0].store).toEqual('memory1')
      expect(allData[0].data).toEqual(data)
      expect(allData[0].metadata.store).toEqual('memory1')
      expect.assertions(5)
    })
    it('should store object with empty options object', async () => {
      const data = { test: 'test' }
      const res = await dataManager.save({
        data,
        options: {},
      })

      const allData = await dataManager.query({})
      expect(allData).toHaveLength(2)
      expect(allData[0].metadata.id).toEqual(res[0].id)
      expect(res[0].store).toEqual('memory1')
      expect(allData[0].data).toEqual(data)
      expect(allData[0].metadata.store).toEqual('memory1')
      expect.assertions(5)
    })
    it('should store multiple objects in same memory store', async () => {
      const data = { test: 'test' }
      const res = await dataManager.save({
        data,
        options: { store: 'memory1' },
      })
      const res2 = await dataManager.save({
        data,
        options: { store: 'memory1' },
      })

      const allData = await dataManager.query({})
      expect(allData).toHaveLength(2)
      expect(allData[0].metadata.id).toEqual(res[0].id)
      expect(res[0].store).toEqual('memory1')
      expect(allData[0].data).toEqual(data)
      expect(allData[0].metadata.store).toEqual('memory1')
      expect(allData[0].data).toEqual(data)
      expect(allData[1].metadata.id).toEqual(res2[0].id)
      expect(res2[0].store).toEqual('memory1')
      expect(allData[1].data).toEqual(data)
      expect(allData[1].metadata.store).toEqual('memory1')
      expect(allData[1].data).toEqual(data)
      expect.assertions(11)
    })
    it('should store object in multiple stores', async () => {
      const data = { test: 'test' }
      const res = await dataManager.save({
        data,
        options: { store: ['memory1', 'memory2'] },
      })

      const allData = await dataManager.query({})
      expect(allData).toHaveLength(2)
      expect(allData[0].metadata.id).toEqual(res[0].id)
      expect(allData[1].metadata.id).toEqual(res[1].id)
      expect(res[0].store).toEqual('memory1')
      expect(res[1].store).toEqual('memory2')
      expect(allData[0].data).toEqual(data)
      expect(allData[1].data).toEqual(data)
      expect(allData[0].metadata.store).toEqual('memory1')
      expect(allData[1].metadata.store).toEqual('memory2')
      expect.assertions(9)
    })
    it('should clear objects from multiple stores', async () => {
      const data = { test: 'test' }
      const res = await dataManager.save({
        data,
        options: { store: ['memory1', 'memory2'] },
      })

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const rews = await dataManager.clear({})
      const allData = await dataManager.query({})
      expect(allData).toHaveLength(0)
      expect.assertions(1)
    })
    it('should query all object with empty options object', async () => {
      const data = { test: 'test' }
      const res = await dataManager.save({
        data,
        options: { store: 'memory1' },
      })

      const allData = await dataManager.query({
        filter: { type: 'id', filter: res[0].id },
        options: {},
      })
      expect(allData).toHaveLength(1)
      expect(allData[0].metadata.id).toEqual(res[0].id)
      expect(res[0].store).toEqual('memory1')
      expect(allData[0].data).toEqual(data)
      expect(allData[0].metadata.store).toEqual('memory1')
      expect.assertions(5)
    })
    it('should query object by id', async () => {
      const data = { test: 'test' }
      const res = await dataManager.save({
        data,
        options: { store: 'memory1' },
      })

      const allData = await dataManager.query({
        filter: { type: 'id', filter: res[0].id },
      })
      expect(allData).toHaveLength(1)
      expect(allData[0].metadata.id).toEqual(res[0].id)
      expect(res[0].store).toEqual('memory1')
      expect(allData[0].data).toEqual(data)
      expect(allData[0].metadata.store).toEqual('memory1')
      expect.assertions(5)
    })
    it('should query object by id in specific store', async () => {
      const data = { test: 'test' }
      const res = await dataManager.save({
        data,
        options: { store: 'memory1' },
      })

      const allData = await dataManager.query({
        filter: { type: 'id', filter: res[0].id },
        options: { store: 'memory1' },
      })
      expect(allData).toHaveLength(1)
      expect(allData[0].metadata.id).toEqual(res[0].id)
      expect(res[0].store).toEqual('memory1')
      expect(allData[0].data).toEqual(data)
      expect(allData[0].metadata.store).toEqual('memory1')
      expect.assertions(5)
    })
    it('should fail query object by id in specific store', async () => {
      const data = { test: 'test' }
      const res = await dataManager.save({
        data,
        options: { store: 'memory1' },
      })

      const allData = await dataManager.query({
        filter: { type: 'id', filter: 'wrong_id' },
        options: { store: 'memory1' },
      })
      expect(allData).toHaveLength(0)
      expect.assertions(1)
    })
    it('should fail query object by id in multiple stores once', async () => {
      const data = { test: 'test' }
      const res = await dataManager.save({
        data,
        options: { store: 'memory1' },
      })
      const res2 = await dataManager.save({
        data,
        options: { store: 'memory2' },
      })
      const allData = await dataManager.query({
        filter: { type: 'id', filter: res2[0].id },
        options: { store: ['memory1', 'memory2'] },
      })
      expect(allData).toHaveLength(1)
      expect.assertions(1)
    })
    it('should query objects without store', async () => {
      const data = { test: 'test' }
      const res = await dataManager.save({
        data,
        options: { store: 'memory1' },
      })

      const allData = await dataManager.query({
        options: { returnStore: false },
      })
      expect(allData).toHaveLength(1)
      expect(allData[0].metadata.id).toEqual(res[0].id)
      expect(res[0].store).toEqual('memory1')
      expect(allData[0].data).toEqual(data)
      expect(allData[0].metadata.store).toBeUndefined()
      expect.assertions(5)
    })
    it('should query object by jsonpath (id)', async () => {
      const data = { test: 'test' }
      const res = await dataManager.save({
        data,
        options: { store: 'memory1' },
      })

      const allData = await dataManager.query({
        filter: {
          type: 'jsonpath',
          filter: `$[?(@.metadata.id == "${res[0].id}")]`,
        },
      })
      expect(allData).toHaveLength(1)
      expect(allData[0].metadata.id).toEqual(res[0].id)
      expect(res[0].store).toEqual('memory1')
      expect(allData[0].data).toEqual(data)
      expect(allData[0].metadata.store).toEqual('memory1')
      expect.assertions(5)
    })
    it('should query object by jsonpath (data) from multiple stores', async () => {
      const data = { test: 'test' }
      const res = await dataManager.save({
        data,
        options: { store: ['memory1', 'memory2'] },
      })

      const allData = await dataManager.query({
        filter: {
          type: 'jsonpath',
          filter: `$[?(@.data.test == "test")]`,
        },
      })
      expect(allData).toHaveLength(2)
      expect(allData[0].metadata.id).toEqual(res[0].id)
      expect(res[0].store).toEqual('memory1')
      expect(allData[0].data).toEqual(data)
      expect(allData[0].metadata.store).toEqual('memory1')
      expect(allData[1].metadata.id).toEqual(res[1].id)
      expect(res[1].store).toEqual('memory2')
      expect(allData[1].data).toEqual(data)
      expect(allData[1].metadata.store).toEqual('memory2')
      expect.assertions(9)
    })
    it('should query object by jsonpath (multiple conditions)', async () => {
      const data = { test: 'test' }
      const data2 = { test: 'test', test2: 'test2' }
      const res = await dataManager.save({
        data,
        options: { store: 'memory1' },
      })
      const res2 = await dataManager.save({
        data: data2,
        options: { store: 'memory2' },
      })

      const allData = await dataManager.query({
        filter: {
          type: 'jsonpath',
          filter: `$[?(@.data.test == "test" && @.data.test2 == "test2")]`,
        },
      })
      expect(allData).toHaveLength(1)
      expect(allData[0].metadata.id).toEqual(res2[0].id)
      expect(res2[0].store).toEqual('memory2')
      expect(allData[0].data).toEqual(data2)
      expect(allData[0].metadata.store).toEqual('memory2')
      expect.assertions(5)
    })
    it('should delete object by id from all stores', async () => {
      const data = { test: 'test' }
      const res = await dataManager.save({
        data,
        options: { store: 'memory2' },
      })

      const del = await dataManager.delete({ id: res[0].id })
      const allData = await dataManager.query({})
      expect(allData).toHaveLength(0)
      expect.assertions(1)
    })
    it('should delete object by id from specific store', async () => {
      const data = { test: 'test' }
      const res = await dataManager.save({
        data,
        options: { store: 'memory2' },
      })

      const del = await dataManager.delete({
        id: res[0].id,
        options: { store: 'memory2' },
      })
      const allData = await dataManager.query({})
      expect(allData).toHaveLength(0)
      expect.assertions(1)
    })
    it('should delete object by id from multiple store', async () => {
      const data = { test: 'test' }
      const res = await dataManager.save({
        data,
        options: { store: ['memory2', 'memory1'] },
      })

      const del = await dataManager.delete({
        id: res[0].id,
        options: { store: ['memory2', 'memory1'] },
      })
      const allData = await dataManager.query({})
      expect(allData).toHaveLength(1)
      expect.assertions(1)
    })
  })
})
