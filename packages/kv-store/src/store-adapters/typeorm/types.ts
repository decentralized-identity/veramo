import { OrPromise } from '@veramo/utils'
import { DataSource } from 'typeorm'
import { KeyvDeserializedData } from '../../keyv/keyv-types.js'

/**
 * @public
 */
export type KeyValueTypeORMOptions = {
  dbConnection: OrPromise<DataSource>

  namespace?: string
}

/**
 * Internal options for the TypeORM adapter
 *  @internal
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export type Options_<Value> = {
  validator: (value: any, key: string) => boolean
  dialect: string
  serialize: (data: KeyvDeserializedData<Value>) => OrPromise<string | undefined>
  /** A custom deserialization function. */
  deserialize: (data: any) => OrPromise<KeyvDeserializedData<Value> | undefined>
}
