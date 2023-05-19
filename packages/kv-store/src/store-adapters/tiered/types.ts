import { IKeyValueStoreAdapter } from '../../key-value-types.js'

export type Options<ValueType> = {
  local: IKeyValueStoreAdapter<ValueType> | Map<string, ValueType>
  remote: IKeyValueStoreAdapter<ValueType> | Map<string, ValueType>
  localOnly?: boolean
  iterationLimit?: number | string
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export type Options_ = {
  validator: (value: any, key: string) => boolean
  dialect: string
  iterationLimit?: number | string
  localOnly?: boolean
}
