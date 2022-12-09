import {
  AbstractDataStore,
  ISaveArgs,
  IFilterArgs,
  IQueryResult,
  IDeleteArgs,
} from './abstractDataStore';
import { v4 } from 'uuid';
import jsonpath from 'jsonpath';

/**
 * An implementation of {@link AbstractDataStore} that stores everything in memory.
 */
export class MemoryDataStore extends AbstractDataStore {
  private data: Record<string, unknown> = {};

  // eslint-disable-next-line @typescript-eslint/require-await
  public async save(args: ISaveArgs): Promise<string> {
    const id = v4();
    this.data[id] = args.data;
    return id;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  public async delete(args: IDeleteArgs): Promise<boolean> {
    const { id } = args;
    if (id in this.data) {
      delete this.data[id];
      return true;
    }
    return false;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  public async query(args: IFilterArgs): Promise<Array<IQueryResult>> {
    const { filter } = args;
    if (filter && filter.type === 'id') {
      try {
        if (this.data[filter.filter as string]) {
          const obj = [
            {
              metadata: { id: filter.filter as string },
              data: this.data[filter.filter as string],
            },
          ];
          return obj;
        } else return [];
      } catch (e) {
        throw new Error('Invalid id');
      }
    }
    if (filter === undefined || (filter && filter.type === 'none')) {
      return Object.keys(this.data).map((k) => {
        return {
          metadata: { id: k },
          data: this.data[k],
        };
      });
    }
    if (filter && filter.type === 'jsonpath') {
      const objects = Object.keys(this.data).map((k) => {
        return {
          metadata: { id: k },
          data: this.data[k],
        };
      });
      const filteredObjects = jsonpath.query(objects, filter.filter as string);
      return filteredObjects as Array<IQueryResult>;
    }
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  public async clear(args: IFilterArgs): Promise<boolean> {
    this.data = {};
    return true;
  }
}
