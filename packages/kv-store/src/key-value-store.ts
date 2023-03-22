import { IAgentPlugin } from '@veramo/core-types'
import {
  DeserializedValueData,
  IKeyValueStore,
  KVStoreDeleteArgs,
  KVStoreDeleteManyArgs,
  KVStoreGetArgs,
  KVStoreGetManyArgs,
  KVStoreHasArgs,
  KVStoreOnArgs, KVStoreOptions,
  KVStoreSetArgs,
} from './key-value-types'
import { Keyv } from './keyv-ts-impl/keyv'

/**
 * Agent plugin that implements {@link @veramo/core-types#IKeyValueStore} interface
 * @public
 */
export class KeyValueStore<ValueType> implements IAgentPlugin {
  /**
   * Plugin methods
   * @public
   */
  readonly methods: IKeyValueStore<ValueType>
  private readonly keyv: Keyv<ValueType>


  constructor(options: KVStoreOptions<ValueType>) {
    this.methods = {
      kvStoreOn: this.kvStoreOn.bind(this),
      kvStoreGet: this.kvStoreGet.bind(this),
      kvStoreGetMany: this.kvStoreGetMany.bind(this),
      kvStoreSet: this.kvStoreSet.bind(this),
      kvStoreHas: this.kvStoreHas.bind(this),
      kvStoreDelete: this.kvStoreDelete.bind(this),
      kvStoreDeleteMany: this.kvStoreDeleteMany.bind(this),
      kvStoreClear: this.kvStoreClear.bind(this),
      kvStoreDisconnect: this.kvStoreDisconnect.bind(this),
    }
    this.keyv = new Keyv(options.uri, options)
  }

  private async kvStoreGet(args: KVStoreGetArgs): Promise<DeserializedValueData<ValueType> | undefined> {
    const result = await this.keyv.get(args.key, { raw: false })
    if (result === null || result === undefined) {
      return undefined
    }
    return this.toDeserializedValueData(result)
  }


  private async kvStoreGetMany(args: KVStoreGetManyArgs): Promise<Array<DeserializedValueData<ValueType>>> {
    const result = await this.keyv.getMany(args.keys, { raw: false })

    // Please note we are filtering all the undefined/null values from the result here and below!
    // I guess we could opt to keep the same indexes as the argument and make them undefined
    if (result === null || result === undefined || result.length === 0) {
      return []
    }
    return result.filter(v => !!v).map(v => this.toDeserializedValueData(v))
  }

  private async kvStoreSet(args: KVStoreSetArgs<ValueType>): Promise<boolean> {
    return await this.keyv.set(args.key, args.value, args.ttl)
  }


  private async kvStoreHas(args: KVStoreHasArgs): Promise<boolean> {
    return await this.keyv.has(args.key)
  }

  private async kvStoreDelete(args: KVStoreDeleteArgs): Promise<boolean> {
    return await this.keyv.delete(args.key)
  }


  private async kvStoreDeleteMany(args: KVStoreDeleteManyArgs): Promise<boolean> {
    return await this.keyv.delete(args.keys)
  }


  private async kvStoreClear(): Promise<IKeyValueStore<ValueType>> {
    await this.keyv.clear()
    return this.methods
  }

  private async kvStoreDisconnect(): Promise<void> {
    return this.keyv.disconnect()
  }

  private async kvStoreOn(args: KVStoreOnArgs): Promise<IKeyValueStore<ValueType>> {
    this.keyv.on(args.eventName, args.listener)
    return this.methods
  }

  private toDeserializedValueData(result: any): DeserializedValueData<ValueType> {
    if (result === null || result === undefined) {
      throw Error(`Result cannot be undefined or null at this this point`)
    } else if (typeof result !== 'object') {
      return { value: result }
    } else if (!('value' in result)) {
      return { value: result }
    }
    return result as DeserializedValueData<ValueType>
  }
}
