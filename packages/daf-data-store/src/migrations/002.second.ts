import { DbDriver, Migration } from '../types'

export const second: Migration = {
  run: async (db: DbDriver) => {
    await db.run(
      `CREATE INDEX IF NOT EXISTS "messages_hash" ON "messages" ("hash");`,
      [],
    )
    await db.run(
      `CREATE INDEX IF NOT EXISTS "messages_parent_hash" ON "messages" ("parent_hash");`,
      [],
    )
    await db.run(
      `CREATE INDEX IF NOT EXISTS "messages_sub" ON "messages" ("sub");`,
      [],
    )
    await db.run(
      `CREATE INDEX IF NOT EXISTS "messages_iss" ON "messages" ("iss");`,
      [],
    )

    await db.run(
      `CREATE INDEX IF NOT EXISTS "messages_source_type" ON "messages" ("source_type");`,
      [],
    )

    await db.run(
      `CREATE INDEX IF NOT EXISTS "messages_source_id" ON "messages" ("source_id");`,
      [],
    )

    await db.run(
      `CREATE INDEX IF NOT EXISTS "verifiable_credentials_parent_hash" ON "verifiable_credentials" ("parent_hash");`,
      [],
    )
    await db.run(
      `CREATE INDEX IF NOT EXISTS "verifiable_credentials_iss" ON "verifiable_credentials" ("iss");`,
      [],
    )
    await db.run(
      `CREATE INDEX IF NOT EXISTS "verifiable_credentials_sub" ON "verifiable_credentials" ("sub");`,
      [],
    )

    await db.run(
      `CREATE INDEX IF NOT EXISTS "verifiable_credentials_fields_parent_hash" ON "verifiable_credentials_fields" ("parent_hash");`,
      [],
    )
    await db.run(
      `CREATE INDEX IF NOT EXISTS "verifiable_credentials_fields_sub" ON "verifiable_credentials_fields" ("sub");`,
      [],
    )
    await db.run(
      `CREATE INDEX IF NOT EXISTS "verifiable_credentials_fields_iss" ON "verifiable_credentials_fields" ("iss");`,
      [],
    )
    await db.run(
      `CREATE INDEX IF NOT EXISTS "verifiable_credentials_fields_claim_type" ON "verifiable_credentials_fields" ("claim_type");`,
      [],
    )
  },
}
