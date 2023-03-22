import type { Keyv } from '../keyv';

export type Options = {
  local: Keyv<any>;
  remote: Keyv<any>;
  localOnly?: boolean;
  iterationLimit?: number | string;
};

// eslint-disable-next-line @typescript-eslint/naming-convention
export type Options_ = {
  validator: (value: any, key: string) => boolean;
  dialect: string;
  iterationLimit?: number | string;
  localOnly?: boolean;
};
