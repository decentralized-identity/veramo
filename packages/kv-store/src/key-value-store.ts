import { IAgentPlugin } from '@veramo/core-types'
import {
  IValueData,
  IKeyValueStore,
  IKeyValueStoreDeleteArgs,
  IKeyValueStoreDeleteManyArgs,
  IKeyValueStoreGetArgs,
  IKeyValueStoreGetManyArgs,
  IKeyValueStoreHasArgs,
  IKeyValueStoreOnArgs, IKeyValueStoreOptions,
  IKeyValueStoreSetArgs,
} from './key-value-types.js'
import { Keyv } from './keyv/keyv.js'
import { KeyvDeserializedData, KeyvOptions, KeyvStoredData } from './keyv/keyv-types.js'

/**
 * Agent plugin that implements {@link @veramo/core-types#IKeyValueStore} interface
 * @public
 */
export class KeyValueStore implements IAgentPlugin {
  /**
   * Plugin methods
   * @public
   */
  readonly methods: IKeyValueStore

  /**
   * The main keyv typescript port which delegates to the storage adapters and takes care of some common functionality
   *
   * @private
   */
  private readonly keyv: Keyv<ValueType>


  constructor(options: IKeyValueStoreOptions<ValueType>) {
    this.methods = {
      kvStoreGet: this.kvStoreGet.bind(this),
      kvStoreGetAsValueData: this.kvStoreGetAsValueData.bind(this),
      kvStoreGetMany: this.kvStoreGetMany.bind(this),
      kvStoreGetManyAsValueData: this.kvStoreGetManyAsValueData.bind(this),
      kvStoreSet: this.kvStoreSet.bind(this),
      kvStoreHas: this.kvStoreHas.bind(this),
      kvStoreDelete: this.kvStoreDelete.bind(this),
      kvStoreDeleteMany: this.kvStoreDeleteMany.bind(this),
      kvStoreClear: this.kvStoreClear.bind(this),
      kvStoreDisconnect: this.kvStoreDisconnect.bind(this),
    }
    this.keyv = new Keyv(options.uri, options as KeyvOptions<ValueType>)
  }

  private async kvStoreGet<ValueType>(args: IKeyValueStoreGetArgs): Promise<ValueType | undefined> {
    const result = await this.keyv.get(args.key, { raw: true })
    if (result === null || result === undefined) {
      return undefined
    }
    return result as ValueType
  }

  private async kvStoreGetAsValueData<ValueType>(args: IKeyValueStoreGetArgs): Promise<IValueData<ValueType>> {
    const result = await this.keyv.get(args.key, { raw: false })
    if (result === null || result === undefined) {
      // We always return a ValueData object for this method
      return { value: undefined, expires: undefined }
    }
    return this.toDeserializedValueData(result)
  }

  private async kvStoreGetMany<ValueType>(args: IKeyValueStoreGetManyArgs): Promise<Array<ValueType | undefined>> {
    if (!args.keys || args.keys.length === 0) {
      return []
    }
    let result = await this.keyv.getMany(args.keys, { raw: true })

    // Making sure we return the same array length as the amount of key(s) passed in
    if (result === null || result === undefined || result.length === 0) {
      result = new Array<ValueType | undefined>()
      for (const key of args.keys) {
        result.push(undefined)
      }
    }
    return result.map(v => !!v ? v as ValueType : undefined)
  }

  private async kvStoreGetManyAsValueData<ValueType>(args: IKeyValueStoreGetManyArgs): Promise<Array<IValueData<ValueType>>> {
    if (!args.keys || args.keys.length === 0) {
      return []
    }
    let result = await this.keyv.getMany(args.keys, { raw: false })

    // Making sure we return the same array length as the amount of key(s) passed in
    if (result === null || result === undefined || result.length === 0) {
      result = new Array<KeyvStoredData<ValueType>>()
      for (const key of args.keys) {
        result.push({ value: undefined, expires: undefined } as KeyvDeserializedData<ValueType>)
      }
    }
    return result.map(v => !!v ? this.toDeserializedValueData(v) : { value: undefined, expires: undefined })
  }

  private async kvStoreSet<ValueType>(args: IKeyValueStoreSetArgs<ValueType>): Promise<boolean> {
    return await this.keyv.set(args.key, args.value, args.ttl)
  }


  private async kvStoreHas(args: IKeyValueStoreHasArgs): Promise<boolean> {
    return await this.keyv.has(args.key)
  }

  private async kvStoreDelete(args: IKeyValueStoreDeleteArgs): Promise<boolean> {
    return await this.keyv.delete(args.key)
  }


  private async kvStoreDeleteMany(args: IKeyValueStoreDeleteManyArgs): Promise<boolean> {
    return await this.keyv.delete(args.keys)
  }


  private async kvStoreClear(): Promise<IKeyValueStore> {
    await this.keyv.clear()
    return this.methods
  }

  private async kvStoreDisconnect(): Promise<void> {
    return this.keyv.disconnect()
  }

  // Public so parties using the kv store directly can add listeners if they want
  public async kvStoreOn(args: IKeyValueStoreOnArgs): Promise<IKeyValueStore> {
    this.keyv.on(args.eventName, args.listener)
    return this.methods
  }

  private toDeserializedValueData<ValueType>(result: any): IValueData<ValueType> {
    if (result === null || result === undefined) {
      throw Error(`Result cannot be undefined or null at this this point`)
    } else if (typeof result !== 'object') {
      return { value: result, expires: undefined }
    } else if (!('value' in result)) {
      return { value: result, expires: undefined }
    }
    return result as IValueData<ValueType>
  }
}
