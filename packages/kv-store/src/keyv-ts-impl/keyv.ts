import EventEmitter from 'events'
import JSONB from 'json-buffer'
import { KeyvDeserializedData, KeyvOptions, KeyvStore, KeyvStoredData } from './keyv-types'


/**
 * Please note that this is code adapted from @link https://github.com/jaredwray/keyv to support Typescript and ESM in Veramo
 *
 * The code should support the storage plugins available for the keyv project.
 * Veramo itself supports NodeJS, Browser and React-Native. Please be aware that these requirements probably aren't true for any keyv storage plugins.
 * The Veramo kv-store module provides out of the box support for in memory/maps, sqlite and typeorm implementations, including a tiered local/remote implementation that support all environments.
 * We welcome any new storage modules
 */
export class Keyv<Value = any> extends EventEmitter implements KeyvStore<Value> {
  readonly opts: KeyvOptions<Value>
  readonly namespace: string
  iterator?: (namespace?: string) => AsyncGenerator<any, void>

  constructor(uri?: string | Map<string, Value | undefined> | KeyvStore<Value | undefined> | undefined, options?: KeyvOptions<Value>) {
    super()
    const emitErrors = options?.emitErrors === undefined ? true : options.emitErrors
    uri = uri ?? options?.uri
    if (!uri) {
      throw Error('No URI provided')
    }
    this.opts = {
      namespace: 'keyv',
      serialize: JSONB.stringify,
      deserialize: JSONB.parse,
      ...((typeof uri === 'string') ? { uri } : uri),
      ...options,
    }

    if (!this.opts.store) {
      if (typeof uri !== 'string') {
        this.opts.store = uri as KeyvStore<Value | undefined>
      } else {
        const adapterOptions = { ...this.opts }
        this.opts.store = loadStore(adapterOptions)
      }
    }
    if (!this.opts.store) {
      throw Error('No store')
    }

    if (this.opts.compression) {
      const compression = this.opts.compression
      this.opts.serialize = compression.serialize.bind(compression)
      this.opts.deserialize = compression.deserialize.bind(compression)
    }

    if (typeof this.opts.store.on === 'function' && emitErrors) {
      this.opts.store.on('error', error => this.emit('error', error))
    }

    this.opts.store.namespace = this.opts.namespace || 'keyv'
    this.namespace = this.opts.store.namespace

    const generateIterator = (iterator: any, keyv: Keyv<any>) => async function* () {
      for await (const [key, raw] of typeof iterator === 'function'
        ? iterator(keyv.store.namespace)
        : iterator) {
        const data = await keyv.deserialize(raw)
        if (keyv.store.namespace && !key.includes(keyv.store.namespace)) {
          continue
        }

        if (data && typeof data.expires === 'number' && Date.now() > data.expires) {
          keyv.delete(key)
          continue
        }

        yield [keyv._getKeyUnprefix(key), data?.value]
      }
    }

    // Attach iterators
    // @ts-ignore
    if (typeof this.store[Symbol.iterator] === 'function' && this.store instanceof Map) {
      this.iterator = generateIterator(this.store, this)
    } else if (typeof this.store.iterator === 'function' && this.store.opts
      && this._checkIterableAdaptar()) {
      this.iterator = generateIterator(this.store.iterator.bind(this.store), this)
    }
  }

  get store(): Required<KeyvStore<Value>> {
    return this.opts.store as Required<KeyvStore<Value>>
  }

  get deserialize() {
    return this.opts.deserialize!
  }

  get serialize() {
    return this.opts.serialize!
  }

  _checkIterableAdaptar() {
    return (this.store.opts.dialect && iterableAdapters.includes(this.store.opts.dialect))
      || (this.store.opts.url && iterableAdapters.findIndex(element => this.store.opts.url.includes(element)) >= 0)
  }

  _getKeyPrefix(key: string): string {
    return `${this.opts.namespace}:${key}`
  }

  _getKeyPrefixArray(keys: string[]): string[] {
    return keys.map(key => this._getKeyPrefix(key))
  }

  _getKeyUnprefix(key: string): string {
    return key
      .split(':')
      .splice(1)
      .join(':')
  }

  getMany(keys: string[], options?: { raw?: boolean }): Array<KeyvStoredData<Value>> | Promise<Array<KeyvStoredData<Value>>> | undefined {
    if (this.store.getMany !== undefined) {
      return this.store.getMany(this._getKeyPrefixArray(keys))
    }

    const keyPrefixed = this._getKeyPrefixArray(keys)
    const promises = []
    for (const key of keyPrefixed) {
      promises.push(Promise.resolve()
        .then(() => this.store.get(key))
        .then(data => (typeof data === 'string') ? this.deserialize(data) : (this.opts.compression ? this.deserialize(data) : data))
        .then(data => {
          if (data === undefined || data === null) {
            return undefined
          }

          if (data && typeof data === 'object' && 'expires' in data && typeof data.expires === 'number' && Date.now() > data.expires) {
            return this.delete(key).then(() => undefined)
          }
          return (options && options.raw) ? data : data && typeof data === 'object' && 'value' in data ? data.value : data
        }),
      )
    }


    return Promise.allSettled(promises)
      .then(promiseResult => {
        const data: KeyvStoredData<Value>[] = []
        for (const result of promiseResult) {
          if (result?.status !== 'rejected') {
            Array.isArray(result.value) ? data.push(...result.value) : data.push(result.value)
          } else {
            data.push(undefined)
          }
        }
        return data
      })

  }

  get(key: string | string[], options?: { raw?: boolean }): Promise<Value | string | KeyvDeserializedData<Value> | KeyvStoredData<Value>[] | undefined> {
    const isArray = Array.isArray(key)
    return Promise.resolve()
      .then(() => isArray ? this.getMany(this._getKeyPrefixArray(key), options) : this.store.get(this._getKeyPrefix(key)))
      .then(data => (typeof data === 'string') ? this.deserialize(data) : (this.opts.compression ? this.deserialize(data) : data))
      .then(data => {
        if (data === undefined || data === null) {
          return undefined
        }
        const rows = Array.isArray(data) ? data : [data]

        if (isArray) {
          const result = []

          for (let row of rows) {
            if (row === undefined || row === null) {
              result.push(undefined)
              continue
            }

            if (this.isExpired(row)) {
              this.delete(key).then(() => undefined)
              result.push(undefined)
            } else {
              result.push((options && options.raw) ? row : toValue(row))
            }
          }

          return result
        } else if (!Array.isArray(data)) {
          if (this.isExpired(data)) {
            return this.delete(key).then(() => undefined)
          }
        }

        return (options && options.raw) ? data : Array.isArray(data) ? data.map(d => toValue(d)) : toValue(data)
      })
  }

  private isExpired(data: KeyvDeserializedData<any> | string | Value): boolean {
    return typeof data !== 'string' && data && typeof data === 'object' && 'expires' in data && typeof data.expires === 'number' && (Date.now() > data.expires)
  }

  set(key: string, value: any, ttl?: number) {
    const keyPrefixed = this._getKeyPrefix(key)
    if (typeof ttl === 'undefined') {
      ttl = this.opts.ttl
    }
    if (ttl === 0) {
      ttl = undefined
    }

    // @ts-ignore
    return Promise.resolve()
      .then(() => {
        const expires = (typeof ttl === 'number') ? (Date.now() + ttl) : undefined
        if (typeof value === 'symbol') {
          this.emit('error', 'symbol cannot be serialized')
        }

        const input = { value, expires }
        return this.serialize(input)
      })
      .then(value => this.store.set(keyPrefixed, value as Value, ttl))
      .then(() => true)
  }

  delete(key: string | string[]) {
    if (!Array.isArray(key)) {
      const keyPrefixed = this._getKeyPrefix(key)
      return Promise.resolve()
        .then(() => this.store.delete(keyPrefixed))
    }

    const keyPrefixed = this._getKeyPrefixArray(key)
    if (this.store.deleteMany !== undefined) {
      return Promise.resolve()
        .then(() => this.store.deleteMany!(keyPrefixed))
    }

    const promises = []
    for (const key of keyPrefixed) {
      promises.push(this.store.delete(key))
    }

    return Promise.allSettled(promises)
      .then(values => values.every(x => x.valueOf() === true))
  }

  async clear(): Promise<void> {
    return Promise.resolve()
      .then(() => this.store.clear())
  }

  has(key: string) {
    const keyPrefixed = this._getKeyPrefix(key)
    return Promise.resolve()
      .then(async () => {
        if (typeof this.store.has === 'function') {
          return this.store.has(keyPrefixed)
        }

        const value = await this.store.get(keyPrefixed)
        return value !== undefined
      })
  }

  disconnect() {
    if (typeof this.store.disconnect === 'function') {
      return this.store.disconnect()
    }
  }
}


const loadStore = (options: KeyvOptions<any>) => {
  const adapters = {
    redis: '@keyv/redis',
    rediss: '@keyv/redis',
    mongodb: '@keyv/mongo',
    mongo: '@keyv/mongo',
    sqlite: '@keyv/sqlite',
    postgresql: '@keyv/postgres',
    postgres: '@keyv/postgres',
    mysql: '@keyv/mysql',
    etcd: '@keyv/etcd',
    offline: '@keyv/offline',
    tiered: './tiered/index.js',
  }
  let adapter = options.adapter
  if (!adapter && options.uri) {
    const regex = /^[^:+]*/
    if (regex) {
      const match = regex.exec(options.uri)
      adapter = Array.isArray(match) ? match[0] : undefined
    }
  }
  if (adapter) {
    // @ts-ignore
    return new (import(adapters[adapter]))(options)
  }

  return new Map()
}

const iterableAdapters = [
  'sqlite',
  'postgres',
  'mysql',
  'mongo',
  'redis',
  'tiered',
]

function toValue<Value>(input: KeyvDeserializedData<Value> | string | Value) {
  return input !== null && typeof input === 'object' && 'value' in input ? input.value : input
}
