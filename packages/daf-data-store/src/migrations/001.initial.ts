import { DbDriver, Migration } from '../types'

export const initial: Migration = {
  run: async (db: DbDriver) => {
    await db.run(
      `CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      thread_id TEXT,
      sender TEXT,
      receiver TEXT,
      type TEXT,
      data TEXT,
      raw TEXT,
      timestamp NUMERIC
      );`,
      [],
    )

    await db.run(
      `CREATE TABLE IF NOT EXISTS messages_meta_data (
      message_id TEXT,
      data TEXT,
      type TEXT,
      id TEXT
      );`,
      [],
    )

    await db.run(
      `CREATE TABLE IF NOT EXISTS verifiable_credentials (
      hash TEXT,
      iss TEXT,
      aud TEXT,
      sub TEXT,
      nbf NUMERIC,
      iat NUMERIC,
      jwt TEXT,
      internal NUMERIC NOT NULL default 1
    );`,
      [],
    )

    await db.run(
      `CREATE TABLE IF NOT EXISTS verifiable_credentials_meta_data (
      message_id TEXT,
      hash TEXT
      );`,
      [],
    )

    await db.run(
      `CREATE TABLE IF NOT EXISTS verifiable_credentials_fields (
      parent_hash INTEGER,
      iss TEXT, sub TEXT,
      nbf NUMERIC,
      iat NUMERIC,
      claim_type TEXT,
      claim_value TEXT,
      is_obj NUMERIC NOT NULL default 0
    );`,
      [],
    )
  },
}
