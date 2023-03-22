import { IPluginMethodMap } from '@veramo/core-types'
import { KeyvStore } from './keyv-ts-impl/keyv-types'


export interface DeserializedValueData<ValueType> {
  value: ValueType;
  expires?: number | undefined;
}

export interface KVStoreOnArgs {
  eventName: string | symbol,
  listener: (...args: any[]) => void
}

export interface KVStoreGetArgs {
  key: string
}

export interface KVStoreGetManyArgs {
  keys: string[]
}
export interface KVStoreHasArgs {
  key: string
}

export interface KVStoreDeleteArgs {
  key: string
}

export interface KVStoreDeleteManyArgs {
  keys: string[]
}

export interface KVStoreSetArgs<ValueType> {
  key: string,
  value: ValueType,
  ttl?: number
}

export interface KVStoreOptions<ValueType> {
  [key: string]: any;

  /** Namespace for the current instance. */
  namespace?: string | undefined;
  /** A custom serialization function. */
  /*serialize?: ((data: KeyvDeserializedData<ValueType>) => OrPromise<string | undefined>)
  /!** A custom deserialization function. *!/
  deserialize?: ((data: any) => OrPromise<KeyvDeserializedData<ValueType> | undefined>);*/
  /** The connection string URI. */
  uri?: string | undefined;
  /** The storage adapter instance to be used by Keyv. */
  store?: KeyvStore<ValueType | undefined> | undefined;
  /** Default TTL. Can be overridden by specifying a TTL on `.set()`. */
  ttl?: number | undefined;
  /** Specify an adapter to use. e.g `'redis'` or `'mongodb'`. */
  adapter?: 'redis' | 'mongodb' | 'mongo' | 'sqlite' | 'postgresql' | 'postgres' | 'mysql' | string | object | undefined;
  /** Enable compression option **/
  /*compression?: KeyvCompressionAdapter | undefined;*/

  emitErrors?: boolean
}

export interface IKeyValueStore<ValueType> extends IPluginMethodMap {

  kvStoreGet(args: KVStoreGetArgs): Promise<DeserializedValueData<ValueType> | undefined>

  kvStoreOn(args: KVStoreOnArgs): Promise<IKeyValueStore<ValueType>>

  kvStoreGetMany(
    args: KVStoreGetManyArgs,
  ): Promise<Array<DeserializedValueData<ValueType> | undefined>>;

  kvStoreSet(args: KVStoreSetArgs<ValueType>): Promise<any>;

  kvStoreDelete(args: KVStoreDeleteArgs): Promise<boolean>;

  kvStoreDeleteMany(args: KVStoreDeleteManyArgs): Promise<boolean>;

  kvStoreClear(): Promise<IKeyValueStore<ValueType>>;

  kvStoreHas(args: KVStoreHasArgs): Promise<boolean>;

  kvStoreDisconnect(): Promise<void>

}
