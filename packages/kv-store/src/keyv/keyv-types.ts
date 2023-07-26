/**
 * Please be aware these types are compatible with the keyv package, to ensure we can use its store-adapters for free.
 *
 * Be very careful when extending/changing!. Normally you will want to create an adapter or decorator for your additional behaviour or requirements
 */
import { OrPromise } from '@veramo/utils'

export interface KeyvOptions<Value> {
  [key: string]: any

  /** Namespace for the current instance. */
  namespace?: string | undefined
  /** A custom serialization function. */
  serialize?: (data: KeyvDeserializedData<Value>) => OrPromise<string | undefined>
  /** A custom deserialization function. */
  deserialize?: (data: any) => OrPromise<KeyvDeserializedData<Value> | undefined>
  /** The connection string URI. */
  uri?: string | undefined
  /** The storage adapter instance to be used by Keyv. */
  store?: KeyvStore<Value | undefined> | undefined
  /** Default TTL. Can be overridden by specififying a TTL on `.set()`. */
  ttl?: number | undefined
  /** Specify an adapter to use. e.g `'redis'` or `'mongodb'`. */
  adapter?:
    | 'redis'
    | 'mongodb'
    | 'mongo'
    | 'sqlite'
    | 'postgresql'
    | 'postgres'
    | 'mysql'
    | object
    | string
    | undefined
  /** Enable compression option **/
  compression?: KeyvCompressionAdapter | undefined

  emitErrors?: boolean
}

export interface KeyvCompressionAdapter {
  compress(value: any, options?: any): OrPromise<any>

  decompress(value: any, options?: any): OrPromise<any>

  serialize(value: any): OrPromise<string>

  deserialize(value: any): OrPromise<any>
}

export interface KeyvDeserializedData<Value> {
  value: Value
  expires: number | undefined
}

export type KeyvStoredData<Value> = KeyvDeserializedData<Value> | string | Value | undefined

export interface KeyvStore<Value> {
  namespace?: string | undefined

  opts: KeyvOptions<Value>

  on?(eventName: string | symbol, listener: (...args: any[]) => void): void
  get(
    key: string | string[],
    options?: { raw?: boolean },
  ): OrPromise<KeyvStoredData<Value> | Array<KeyvStoredData<Value>>>

  getMany?(keys: string[], options?: { raw?: boolean }): OrPromise<Array<KeyvStoredData<Value>>> | undefined

  iterator?(namespace?: string | undefined): AsyncGenerator<any, void, any>

  set(key: string, value: Value, ttl?: number): any

  delete(key: string | string[]): OrPromise<boolean>

  deleteMany?(keys: string[]): OrPromise<boolean>

  clear(): OrPromise<void>

  has?(key: string): OrPromise<boolean>

  disconnect?(): void
}
