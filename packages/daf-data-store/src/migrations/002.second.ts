import { DbDriver, Migration } from '../types'

export const second: Migration = {
  run: async (db: DbDriver) => {
    await db.run(`CREATE INDEX IF NOT EXISTS "messages_id" ON "messages" ("id");`, [])
    await db.run(`CREATE INDEX IF NOT EXISTS "messages_thread_id" ON "messages" ("thread_id");`, [])
    await db.run(`CREATE INDEX IF NOT EXISTS "messages_receiver" ON "messages" ("receiver");`, [])
    await db.run(`CREATE INDEX IF NOT EXISTS "messages_sender" ON "messages" ("sender");`, [])
    await db.run(
      `CREATE INDEX IF NOT EXISTS "messages_meta_data_message_id" ON "messages_meta_data" ("message_id");`,
      [],
    )

    await db.run(`CREATE INDEX IF NOT EXISTS "messages_meta_data_type" ON "messages_meta_data" ("type");`, [])

    await db.run(`CREATE INDEX IF NOT EXISTS "messages_meta_data_id" ON "messages_meta_data" ("id");`, [])

    await db.run(
      `CREATE INDEX IF NOT EXISTS "verifiable_credentials_meta_data_message_id" ON "verifiable_credentials_meta_data" ("message_id");`,
      [],
    )

    await db.run(
      `CREATE INDEX IF NOT EXISTS "verifiable_credentials_meta_data_hash" ON "verifiable_credentials_meta_data" ("hash");`,
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
