import {
  IKeyValueStore,
  IKeyValueStoreOnArgs,
  IKeyValueStoreOptions,
  IValueData,
} from './key-value-types.js'
import { Keyv } from './keyv/keyv.js'
import { KeyvDeserializedData, KeyvOptions, KeyvStoredData } from './keyv/keyv-types.js'

/**
 * Agent plugin that implements {@link @veramo/core-types#IKeyValueStore} interface
 * @public
 */
export class KeyValueStore<ValueType> implements IKeyValueStore<ValueType> {

  /**
   * The main keyv typescript port which delegates to the storage adapters and takes care of some common functionality
   *
   * @private
   */
  private readonly keyv: Keyv<ValueType>

  constructor(options: IKeyValueStoreOptions<ValueType>) {
    this.keyv = new Keyv(options.uri, options as KeyvOptions<ValueType>)
  }

  async get(key: string): Promise<ValueType | undefined> {
    const result = await this.keyv.get(key, { raw: false })
    if (result === null || result === undefined) {
      return undefined
    }
    return result as ValueType
  }

  async getAsValueData(
    key: string,
  ): Promise<IValueData<ValueType>> {
    const result = await this.keyv.get(key, { raw: true })
    if (result === null || result === undefined) {
      // We always return a ValueData object for this method
      return { value: undefined, expires: undefined }
    }
    return this.toDeserializedValueData(result)
  }

  async getMany(keys: string[]): Promise<Array<ValueType | undefined>> {
    if (!keys || keys.length === 0) {
      return []
    }
    let result = await this.keyv.getMany(keys, { raw: false })

    // Making sure we return the same array length as the amount of key(s) passed in
    if (result === null || result === undefined || result.length === 0) {
      result = new Array<ValueType | undefined>()
      for (const key of keys) {
        result.push(undefined)
      }
    }
    return result.map((v) => (!!v ? (v as ValueType) : undefined))
  }

  async getManyAsValueData(
    keys: string[],
  ): Promise<Array<IValueData<ValueType>>> {
    if (!keys || keys.length === 0) {
      return []
    }
    let result = await this.keyv.getMany(keys, { raw: true })

    // Making sure we return the same array length as the amount of key(s) passed in
    if (result === null || result === undefined || result.length === 0) {
      result = new Array<KeyvStoredData<ValueType>>()
      for (const key of keys) {
        result.push({ value: undefined, expires: undefined } as KeyvDeserializedData<ValueType>)
      }
    }
    return result.map((v) =>
      !!v ? this.toDeserializedValueData(v) : { value: undefined, expires: undefined },
    )
  }

  async set(
    key: string, value: ValueType, ttl?: number,
  ): Promise<IValueData<ValueType>> {
    return this.keyv.set(key, value, ttl).then(() =>
      this.getAsValueData(key),
    )
  }

  async has(key: string): Promise<boolean> {
    return this.keyv.has(key)
  }

  async delete(key: string): Promise<boolean> {
    return this.keyv.delete(key)
  }

  async deleteMany(keys: string[]): Promise<boolean[]> {
    return Promise.all(keys.map(key => this.keyv.delete(key)))
  }

  async clear(): Promise<IKeyValueStore<ValueType>> {
    return this.keyv.clear().then(() => this)
  }

  async disconnect(): Promise<void> {
    return this.keyv.disconnect()
  }

  // Public so parties using the kv store directly can add listeners if they want
  async kvStoreOn(args: IKeyValueStoreOnArgs): Promise<IKeyValueStore<ValueType>> {
    this.keyv.on(args.eventName, args.listener)
    return this
  }

  private toDeserializedValueData<ValueType>(result: any): IValueData<ValueType> {
    if (result === null || result === undefined) {
      throw Error(`Result cannot be undefined or null at this this point`)
    } else if (typeof result !== 'object') {
      return { value: result, expires: undefined }
    } else if (!('value' in result)) {
      return { value: result, expires: undefined }
    }
    if (!('expires' in result)) {
      result.expires = undefined
    }
    return result as IValueData<ValueType>
  }
}
