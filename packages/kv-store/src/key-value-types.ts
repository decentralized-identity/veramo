/**
 * This is how the store will actually store the value.
 * It contains an optional `expires` property, which indicates when the value would expire
 *
 * @beta
 */
export interface IValueData<ValueType> {
  value?: ValueType
  expires?: number
}

/**
 * Event listener arguments
 *
 * @beta
 */
export interface IKeyValueStoreOnArgs {
  eventName: string | symbol
  listener: (...args: any[]) => void
}

/**
 * Options for the Key Value store
 *
 * @beta
 */
export interface IKeyValueStoreOptions<ValueType> {
  [key: string]: any

  /** Namespace for the current instance. */
  namespace?: string | undefined

  /** The connection string URI. */
  uri?: string | undefined
  /** The storage adapter instance to be used by Keyv. or any other implementation */
  store: IKeyValueStoreAdapter<ValueType> | Map<string, ValueType>
  /** Default TTL. Can be overridden by specifying a TTL on `.set()`. */
  ttl?: number | undefined

  emitErrors?: boolean
}

/**
 * A store adapter implementation needs to provide namespace support
 *
 * @beta
 */
export interface IKeyValueStoreAdapter<ValueType> {
  namespace?: string | undefined
}

/**
 * The types that can be stored by a store adapter
 *
 * @public
 */
export type ValueStoreType = object | string | number | boolean

/**
 * A Key Value store is responsible for managing Values identified by keys.
 *
 * @beta
 */
export interface IKeyValueStore<ValueType extends ValueStoreType> {
  /**
   * Get a single value by key. Can be undefined as the underlying store typically will not throw an error for a non existing key
   *
   * @param key - Contains the key to search for
   */
  get(key: string): Promise<ValueType | undefined>

  /**
   * Get a single item as Value Data from the store. Will always return a Value Data Object, but the value in it can be undefined in case the actual store does not contain the value
   *
   * @param key - Contains the key to search for
   */
  getAsValueData(key: string): Promise<IValueData<ValueType>>

  /**
   * @remarks in order to consume the iterator, you need to use the for await syntax as follows:
   *
   * ```
   * for await (const result of store.getIterator()) {
   *   console.log(result)
   * }
   * ```
   *
   * @returns An async iterator for all the keys in the store
   */
  getIterator(): AsyncGenerator<any, void>

  /**
   * Get multiple values from the store. Will always return an array with values, but the values can be undefined in case the actual store does not contain the value for the respective key
   *
   * @param keys - Contains the keys to search for
   */
  getMany(keys: string[]): Promise<Array<ValueType | undefined>>

  /**
   * Get multiple items as Value Data from the store. Will always return an array with Value Data Object, but the value in it can be undefined in case the actual store does not contain the value
   *
   * @param keys - Contains the keys to search for
   */
  getManyAsValueData(keys: string[]): Promise<Array<IValueData<ValueType>>>

  /**
   * Store a single value
   *
   * @param key - The key
   * @param value - The value
   * @param ttl - An optional number how long to store the value in milliseconds. If not provided will be stored indefinitely
   */
  set(key: string, value: ValueType, ttl?: number): Promise<IValueData<ValueType>>

  /**
   * Delete a value from the store by key
   *
   * @param key - The key to delete the value for
   */
  delete(key: string): Promise<boolean>

  /**
   * Delete multiple values by provided keys
   *
   * @param keys - The keys to delete the values for
   */
  deleteMany(keys: string[]): Promise<boolean[]>

  /**
   * Clear the whole store (delete all values)
   */
  clear(): Promise<IKeyValueStore<ValueType>>

  /**
   * Determine whether the store has the value belonging to the provided key
   *
   * @param key - The key to search for
   */
  has(key: string): Promise<boolean>

  /**
   * Disconnect the backing store. After this operation the store typically cannot be reused, unless the store object is re-instantiated
   */
  disconnect(): Promise<void>
}
