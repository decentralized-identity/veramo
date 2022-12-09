import { IPluginMethodMap } from '@veramo/core';
export interface IDataManager extends IPluginMethodMap {
  query(args: IDataManagerQueryArgs): Promise<Array<IDataManagerQueryResult>>;

  save(args: IDataManagerSaveArgs): Promise<Array<IDataManagerSaveResult>>;

  delete(args: IDataManagerDeleteArgs): Promise<Array<boolean>>;

  clear(args: IDataManagerClearArgs): Promise<Array<boolean>>;
}

/**
 *  Types
 */
export type Filter = {
  type: string;
  filter: unknown;
};

type QueryOptions = {
  store?: string | string[];
  returnStore?: boolean;
};

type DeleteOptions = {
  store: string | string[];
};

type SaveOptions = {
  store: string | string[];
};

type ClearOptions = {
  store: string | string[];
};

type QueryMetadata = {
  id: string;
  store?: string;
};

/**
 *  Interfaces for DataManager method arguments
 */
export interface IDataManagerQueryArgs {
  filter?: Filter;
  options?: QueryOptions;
}

export interface IDataManagerDeleteArgs {
  id: string;
  options?: DeleteOptions;
}

export interface IDataManagerSaveArgs {
  data: unknown;
  options: SaveOptions;
}

export interface IDataManagerClearArgs {
  filter?: Filter;
  options?: ClearOptions;
}

/**
 * Interfaces for DataManager method return values
 */
export interface IDataManagerQueryResult {
  data: unknown;
  metadata: QueryMetadata;
}

export interface IDataManagerSaveResult {
  id: string;
  store: string;
}
