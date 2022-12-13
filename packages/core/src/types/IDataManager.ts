import { IPluginMethodMap } from './IAgent'
export interface IDataManager extends IPluginMethodMap {
  query(args: IDataManagerQueryArgs): Promise<Array<IDataManagerQueryResult>>

  save(args: IDataManagerSaveArgs): Promise<Array<IDataManagerSaveResult>>

  delete(args: IDataManagerDeleteArgs): Promise<Array<boolean>>

  clear(args: IDataManagerClearArgs): Promise<Array<boolean>>
}

/**
 *  Types
 */
export type Filter = {
  type: string
  filter: unknown
}

export type Options = {
  store?: string | string[]
}

export type QueryOptions = Options & {
  returnStore?: boolean
}

export type DeleteOptions = Options

export type SaveOptions = Options

export type ClearOptions = Options

export type QueryMetadata = {
  id: string
  store?: string
}

/**
 *  Interfaces for DataManager method arguments
 */
export interface IDataManagerQueryArgs {
  filter?: Filter
  options?: QueryOptions
}

export interface IDataManagerDeleteArgs {
  id: string
  options?: DeleteOptions
}

export interface IDataManagerSaveArgs {
  data: unknown
  options?: SaveOptions
}

export interface IDataManagerClearArgs {
  filter?: Filter
  options?: ClearOptions
}

/**
 * Interfaces for DataManager method return values
 */
export interface IDataManagerQueryResult {
  data: unknown
  metadata: QueryMetadata
}

export interface IDataManagerSaveResult {
  id: string
  store: string
}
