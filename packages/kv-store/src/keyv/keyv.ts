import { EventEmitter } from 'events'
import JSONB from 'json-buffer'
import { KeyvDeserializedData, KeyvOptions, KeyvStore, KeyvStoredData } from './keyv-types.js'

/**
 * Please note that this is code adapted from @link https://github.com/jaredwray/keyv to support Typescript and ESM in Veramo
 *
 * The code should support the storage plugins available for the keyv project.
 * Veramo itself supports NodeJS, Browser and React-Native environment.
 * Please be aware that these requirements probably aren't true for any keyv storage plugins.
 *
 * One of the big changes compared to the upstream project is that this port does not have dynamic loading of store-adapters based on URIs.
 * We believe that any Veramo Key Value store should use explicitly defined store-adapters.
 *
 * The port is part of the Veramo Key Value Store module, as we do not want to make an official maintained port out of it.
 * Veramo exposes its own API/interfaces for the Key Value store, meaning we could also support any other implementation in the future
 *
 * The Veramo kv-store module provides out of the box support for in memory/maps, sqlite and typeorm implementations,
 * including a tiered local/remote implementation that support all environments.
 *
 * We welcome any new storage modules
 */
export class Keyv<Value = any> extends EventEmitter implements KeyvStore<Value> {
  readonly opts: KeyvOptions<Value>
  readonly namespace: string
  iterator?: (namespace?: string) => AsyncGenerator<any, void>

  constructor(
    uri?: string | Map<string, Value | undefined> | KeyvStore<Value> | undefined,
    options?: KeyvOptions<Value>,
  ) {
    super()
    const emitErrors = options?.emitErrors === undefined ? true : options.emitErrors
    uri = uri ?? options?.uri
    /*if (!uri) {
      throw Error('No URI provided')
    }*/
    this.opts = {
      namespace: 'keyv',
      serialize: JSONB.stringify,
      deserialize: JSONB.parse,
      ...(typeof uri === 'string' ? { uri } : uri),
      ...options,
    }

    if (!this.opts.store) {
      if (typeof uri !== 'string') {
        this.opts.store = uri as KeyvStore<Value | undefined>
      } /* else {
        const adapterOptions = { ...this.opts }
        this.opts.store = loadStore(adapterOptions)
      }*/
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
      this.opts.store.on('error', (error) => this.emit('error', error))
    }

    this.opts.store.namespace = this.opts.namespace || 'keyv'
    this.namespace = this.opts.store.namespace

    const generateIterator = (iterator: any, keyv: Keyv<any>) =>
      async function* () {
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
    } else if (typeof this.store.iterator === 'function' && this.store.opts && this._checkIterableAdapter()) {
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

  _checkIterableAdapter() {
    return (
      (this.store.opts.dialect && iterableAdapters.includes(this.store.opts.dialect)) ||
      (this.store.opts.url &&
        iterableAdapters.findIndex((element) => this.store.opts.url.includes(element)) >= 0)
    )
  }

  _getKeyPrefix(key: string): string {
    return `${this.opts.namespace}:${key}`
  }

  _getKeyPrefixArray(keys: string[]): string[] {
    return keys.map((key) => this._getKeyPrefix(key))
  }

  _getKeyUnprefix(key: string): string {
    return key.split(':').splice(1).join(':')
  }

  async getMany(keys: string[], options?: { raw?: boolean }): Promise<Array<KeyvStoredData<Value>>> {
    const keyPrefixed = this._getKeyPrefixArray(keys)
    let promise: Promise<Array<KeyvStoredData<Value>>>
    if (this.store.getMany !== undefined) {
      promise = this.store.getMany(keyPrefixed, options) as Promise<KeyvStoredData<Value>[]> //.then(value => !!value ? value.values() : undefined)
      // todo: Probably wise to check expired ValueData here, if the getMany does not implement this feature itself!
    } else {
      promise = Promise.all(
        keyPrefixed.map((k) => this.store.get(k, options) as Promise<KeyvStoredData<Value>>),
      )
    }
    const allValues = Promise.resolve(promise)
    const results: Promise<KeyvStoredData<Value>>[] = []

    return Promise.resolve(allValues)
      .then((all) => {
        keys.forEach((key, index) => {
          const data = all[index]

          let result =
            typeof data === 'string'
              ? this.deserialize(data)
              : !!data && this.opts.compression
              ? this.deserialize(data)
              : data

          if (
            result &&
            typeof result === 'object' &&
            'expires' in result &&
            typeof result.expires === 'number' &&
            Date.now() > result.expires
          ) {
            this.delete(key)
            result = undefined
          }

          const final = (
            options && options.raw
              ? result
              : result && typeof result === 'object' && 'value' in result
              ? result.value
              : result
          ) as Promise<KeyvStoredData<Value>>

          results.push(final)
        })
      })
      .then(() => Promise.all(results))
  }

  async get(
    key: string | string[],
    options?: { raw?: boolean },
  ): Promise<Value | string | KeyvDeserializedData<Value> | KeyvStoredData<Value>[] | undefined> {
    const isArray = Array.isArray(key)
    return Promise.resolve()
      .then(() =>
        isArray
          ? this.getMany(this._getKeyPrefixArray(key), options)
          : this.store.get(this._getKeyPrefix(key)),
      )
      .then((data) =>
        typeof data === 'string'
          ? this.deserialize(data)
          : this.opts.compression
          ? this.deserialize(data)
          : data,
      )
      .then((data) => {
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
              result.push(options && options.raw ? row : toValue(row))
            }
          }

          return result
        } else if (!Array.isArray(data)) {
          if (this.isExpired(data)) {
            return this.delete(key).then(() => undefined)
          }
        }

        return options && options.raw
          ? data
          : Array.isArray(data)
          ? data.map((d) => toValue(d))
          : toValue(data)
      })
  }

  private isExpired(data: KeyvDeserializedData<any> | string | Value): boolean {
    return (
      typeof data !== 'string' &&
      data &&
      typeof data === 'object' &&
      'expires' in data &&
      typeof data.expires === 'number' &&
      Date.now() > data.expires
    )
  }

  set(key: string, value: Value, ttl?: number) {
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
        const expires = typeof ttl === 'number' ? Date.now() + ttl : undefined
        if (typeof value === 'symbol') {
          this.emit('error', 'symbol cannot be serialized')
        }

        const input = { value, expires }
        return this.serialize(input)
      })
      .then((value) => this.store.set(keyPrefixed, value as Value, ttl))
      .then(() => true)
  }

  delete(key: string | string[]) {
    if (!Array.isArray(key)) {
      const keyPrefixed = this._getKeyPrefix(key)
      return Promise.resolve().then(() => this.store.delete(keyPrefixed))
    }

    const keyPrefixed = this._getKeyPrefixArray(key)
    if (this.store.deleteMany !== undefined) {
      return Promise.resolve().then(() => this.store.deleteMany!(keyPrefixed))
    }

    const promises = []
    for (const key of keyPrefixed) {
      promises.push(this.store.delete(key))
    }

    return Promise.allSettled(promises).then((values) => values.every((x) => x.valueOf() === true))
  }

  async clear(): Promise<void> {
    return Promise.resolve().then(() => this.store.clear())
  }

  has(key: string) {
    const keyPrefixed = this._getKeyPrefix(key)
    return Promise.resolve().then(async () => {
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

const iterableAdapters = ['typeorm', 'sqlite', 'postgres', 'mysql', 'mongo', 'redis', 'tiered']

function toValue<Value>(input: KeyvDeserializedData<Value> | string | Value) {
  return input !== null && typeof input === 'object' && 'value' in input ? input.value : input
}
