import type { Keyv } from '../keyv';
import { OrPromise } from '@veramo/utils'
import { DataSource } from 'typeorm'

export type Options = {

  dbConnection: OrPromise<DataSource>

  namespace?: string
};

// eslint-disable-next-line @typescript-eslint/naming-convention
export type Options_ = {
  validator: (value: any, key: string) => boolean;
  dialect: string;
};
