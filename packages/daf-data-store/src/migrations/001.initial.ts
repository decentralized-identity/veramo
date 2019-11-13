import { DbDriver, Migration } from '../types'

export const initial: Migration = {
  run: async (db: DbDriver) => {
    await db.run(
      `CREATE TABLE IF NOT EXISTS messages (
      hash TEXT,
      parent_hash TEXT,
      iss TEXT,
      sub TEXT,
      type TEXT,
      tag TEXT,
      data TEXT,
      iat NUMERIC,
      nbf NUMERIC,
      jwt TEXT,
      meta TEXT,
      source_type TEXT,
      source_id TEXT,
      internal NUMERIC NOT NULL default 1
    );`,
      [],
    )

    await db.run(
      `CREATE TABLE IF NOT EXISTS verifiable_credentials (
      hash TEXT,
      parent_hash TEXT,
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

    await db.run(
      `CREATE TRIGGER IF NOT EXISTS delete_messages BEFORE DELETE ON "messages" BEGIN
      DELETE FROM verifiable_credentials where parent_hash = old.hash;
    END;`,
      [],
    )

    await db.run(
      `CREATE TRIGGER IF NOT EXISTS delete_verifiable_credentials BEFORE DELETE ON "verifiable_credentials" BEGIN
      DELETE FROM verifiable_credentials_fields where parent_hash = old.hash;
    END;`,
      [],
    )
  },
}
