import KeyvSqlite from '@keyv/sqlite';

import timekeeper from 'timekeeper'
import { Keyv } from '../keyv-ts-impl/keyv.js'

describe('MAP store', () => {
  it('should respect ttl', async () => {
    const store = new Map()
    const keyv = new Keyv(store)
    await keyv.set('key', 'value', 100)

    expect(await keyv.get('key')).toEqual('value')
    timekeeper.freeze(Date.now() + 150)
    expect(await keyv.get('key')).toBeUndefined()
  })
})


describe('sqlite store', () => {
  it('should respect ttl', async () => {
    const keyv = new Keyv(new KeyvSqlite())
    await keyv.set('key', 'value', 100)

    expect(await keyv.get('key')).toEqual('value')
    timekeeper.freeze(Date.now() + 150)
    expect(await keyv.get('key')).toBeUndefined()
  })
})
