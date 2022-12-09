export interface ISaveArgs {
  data: unknown;
  options?: unknown;
}

export interface IDeleteArgs {
  id: string;
}

export interface IFilterArgs {
  filter?: {
    type: string;
    filter: unknown;
  };
}

export interface IQueryResult {
  data: unknown;
  metadata: {
    id: string;
  };
}

export abstract class AbstractDataStore {
  abstract save(args: ISaveArgs): Promise<string>;
  abstract delete(args: IDeleteArgs): Promise<boolean>;
  abstract query(args: IFilterArgs): Promise<Array<IQueryResult>>;
  abstract clear(args: IFilterArgs): Promise<boolean>;
}
