import { EventEmitter } from 'events'
import type { Options, Options_ } from './types.js'
import { KeyvStore, KeyvStoredData } from '../../keyv/keyv-types.js'
import { Keyv } from '../../keyv/keyv.js'
import { IKeyValueStoreAdapter } from '../../key-value-types.js'

type KeyvTieredIndex = 'local' | 'remote'

/**
 * Tiered keyv store adapter, combining 2 adapters/stores into one
 * @alpha
 */
export class KeyValueTieredStoreAdapter<Value>
  extends EventEmitter
  implements KeyvStore<Value>, IKeyValueStoreAdapter<Value>
{
  opts: Options_
  remote: KeyvStore<Value>
  local: KeyvStore<Value>
  iterationLimit?: string | number

  namespace?: string | undefined

  constructor({ remote, local, ...options }: Options<Value>) {
    super()
    this.opts = {
      validator: () => true,
      dialect: 'tiered',
      ...options,
    }

    // todo: since we are instantiating a new Keyv object in case we encounter a map, the key prefix applied twice, given it will be part of a an outer keyv object as well.
    // Probably wise to simply create a Map Store class. As it is an in memory construct, and will work in terms of resolution it does not have highest priority
    this.local = (isMap(local) ? new Keyv<Value>(local as Map<string, Value>) : local) as KeyvStore<Value>
    this.remote = (isMap(remote) ? new Keyv<Value>(remote as Map<string, Value>) : remote) as KeyvStore<Value>
    this.namespace = this.local.namespace
  }

  async get(
    key: string | string[],
    options?: { raw?: boolean },
  ): Promise<KeyvStoredData<Value> | Array<KeyvStoredData<Value>>> {
    if (Array.isArray(key)) {
      return await this.getMany(key, options)
    }
    const localResult = (await this.local.get(key, options)) as KeyvStoredData<Value>

    if (localResult === undefined || !this.opts.validator(localResult, key)) {
      const remoteResult = await this.remote.get(key, options)

      if (remoteResult !== localResult) {
        const value = (
          !!remoteResult
            ? typeof remoteResult === 'object' && 'value' in remoteResult
              ? remoteResult.value
              : remoteResult
            : undefined
        ) as Value
        const ttl =
          !!remoteResult &&
          typeof remoteResult === 'object' &&
          'expires' in remoteResult &&
          remoteResult.expires
            ? remoteResult.expires - Date.now()
            : undefined
        if (!ttl || ttl > 0) {
          await this.local.set(key, value, ttl)
        } else {
          this.local.delete(key)
        }
      }
      return remoteResult
    }

    return localResult
  }

  async getMany(keys: string[], options?: { raw?: boolean }): Promise<Array<KeyvStoredData<Value>>> {
    const promises: Array<Promise<KeyvStoredData<Value>>> = []
    for (const key of keys) {
      promises.push(this.get(key, options) as Promise<KeyvStoredData<Value>>)
    }

    const values = await Promise.all(promises)
    const data: Array<KeyvStoredData<Value>> | undefined = []
    for (const value of values) {
      data.push(value as KeyvStoredData<Value>)
    }
    return data
  }

  async set(key: string, value: any, ttl?: number) {
    const toSet: KeyvTieredIndex[] = ['local', 'remote']
    return Promise.all(toSet.map(async (store) => this[store].set(key, value, ttl)))
  }

  async clear(): Promise<undefined> {
    const toClear: KeyvTieredIndex[] = ['local']
    if (!this.opts.localOnly) {
      toClear.push('remote')
    }

    await Promise.all(toClear.map(async (store) => this[store].clear()))

    return undefined
  }

  async delete(key: string): Promise<boolean> {
    const toDelete: KeyvTieredIndex[] = ['local']
    if (!this.opts.localOnly) {
      toDelete.push('remote')
    }

    const deleted = await Promise.all(toDelete.map(async (store) => this[store].delete(key)))

    return deleted.every(Boolean)
  }

  async deleteMany(keys: string[]): Promise<boolean> {
    const promises = []
    for (const key of keys) {
      promises.push(this.delete(key))
    }

    const values = await Promise.all(promises)

    return values.every(Boolean)
  }

  async has(key: string): Promise<boolean> {
    let response
    if (typeof this.local.has === 'function') {
      response = this.local.has(key)
    } else {
      const value = await this.local.get(key)
      response = value !== undefined
    }
    if (!response || !this.opts.validator(response, key)) {
      if (typeof this.remote.has === 'function') {
        response = this.remote.has(key)
      } else {
        const value = await this.remote.get(key)
        response = value !== undefined
      }
    }
    return response
  }

  async *iterator(namespace?: string): AsyncGenerator<any, void, any> {
    const limit = Number.parseInt(this.iterationLimit as string, 10) || 10
    this.remote.opts.iterationLimit = limit
    if (this.remote && typeof this.remote.iterator === 'function') {
      for await (const entries of this.remote.iterator(namespace)) {
        yield entries
      }
    }
  }
}

function isMap(map: any) {
  if (map instanceof Map) {
    return true
  } else if (
    map &&
    typeof map.clear === 'function' &&
    typeof map.delete === 'function' &&
    typeof map.get === 'function' &&
    typeof map.has === 'function' &&
    typeof map.set === 'function'
  ) {
    return true
  }

  return false
}
