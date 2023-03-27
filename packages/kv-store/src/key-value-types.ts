import { IPluginMethodMap } from '@veramo/core-types'

/**
 * This is how the store will actually store the value.
 * It contains an optional `expires` property, which indicates when the value would expire
 */
export interface IValueData<ValueType> {
  value: ValueType | undefined;
  expires: number | undefined;
}

export interface IKeyValueStoreOnArgs {
  eventName: string | symbol,
  listener: (...args: any[]) => void
}

export interface IKeyValueStoreGetArgs {
  key: string
}

export interface IKeyValueStoreGetManyArgs {
  keys: string[]
}

export interface IKeyValueStoreHasArgs {
  key: string
}

export interface IKeyValueStoreDeleteArgs {
  key: string
}

export interface IKeyValueStoreDeleteManyArgs {
  keys: string[]
}

export interface IKeyValueStoreSetArgs<ValueType> {
  key: string,
  value: ValueType,
  ttl?: number
}

export interface IKeyValueStoreOptions<ValueType> {
  [key: string]: any;

  /** Namespace for the current instance. */
  namespace?: string | undefined;

  /** A custom serialization function. */
  /*serialize?: ((data: KeyvDeserializedData<ValueType>) => OrPromise<string | undefined>)
  /!** A custom deserialization function. *!/
  deserialize?: ((data: any) => OrPromise<KeyvDeserializedData<ValueType> | undefined>);*/
  /** The connection string URI. */
  uri?: string | undefined;
  /** The storage adapter instance to be used by Keyv. or any other implementation */
  store: IKeyValueStoreAdapter<ValueType>;
  /** Default TTL. Can be overridden by specifying a TTL on `.set()`. */
  ttl?: number | undefined;

  /** Enable compression option **/
  /*compression?: KeyvCompressionAdapter | undefined;*/

  emitErrors?: boolean
}

export interface IKeyValueStoreAdapter<ValueType> {
  namespace?: string | undefined
}


export interface IKeyValueStore extends IPluginMethodMap {

  /**
   * Get a single value by key. Can be undefined as the underlying store typically will not throw an error for a non existing key
   *
   * @param args Contains the key to search for
   */
  kvStoreGet<ValueType>(args: IKeyValueStoreGetArgs): Promise<ValueType | undefined>

  /**
   * Get a single item as Value Data from the store. Will always return a Value Data Object, but the value in it can be undefined in case the actual store does not contain the value
   * @param args Contains the key to search for
   */
  kvStoreGetAsValueData<ValueType>(args: IKeyValueStoreGetArgs): Promise<IValueData<ValueType>>

  kvStoreGetMany<ValueType>(
    args: IKeyValueStoreGetManyArgs,
  ): Promise<Array<ValueType | undefined>>;

  kvStoreGetManyAsValueData<ValueType>(
    args: IKeyValueStoreGetManyArgs,
  ): Promise<Array<IValueData<ValueType>>>;

  kvStoreSet<ValueType>(args: IKeyValueStoreSetArgs<ValueType>): Promise<any>;

  kvStoreDelete(args: IKeyValueStoreDeleteArgs): Promise<boolean>;

  kvStoreDeleteMany(args: IKeyValueStoreDeleteManyArgs): Promise<boolean>;

  kvStoreClear(): Promise<IKeyValueStore>;

  kvStoreHas(args: IKeyValueStoreHasArgs): Promise<boolean>;

  kvStoreDisconnect(): Promise<void>

}
