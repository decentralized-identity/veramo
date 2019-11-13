import { initial } from './001.initial'
import { second } from './002.second'
import { DbDriver } from '../types'
import Debug from 'debug'

const debug = Debug('db-migrations')

const availableMigrations = [initial, second]

export const insertLastMigrationId = (db: DbDriver, id: number) => {
  const timestamp = new Date().getTime()
  debug('Finished migration: ' + id)
  return db.run('INSERT INTO migrations VALUES (?, ?)', [id, timestamp])
}

export const runMigrations = async (db: DbDriver) => {
  debug('Running migrations...')

  await db.run(
    'CREATE TABLE IF NOT EXISTS migrations (migrationId TEXT, timestamp TEXT)',
    [],
  )
  const rows = await db.rows(
    'SELECT * FROM migrations ORDER BY migrationId DESC LIMIT 1',
    [],
  )

  let lastMigrationId = -1
  if (rows[0] && rows[0].migrationId) {
    debug(
      'Latest migrationId:' +
        rows[0].migrationId +
        ' finished at:' +
        rows[0].timestamp,
    )
    lastMigrationId = parseInt(rows[0].migrationId, 10)
  }

  const newMigrations = []

  for (let x = lastMigrationId + 1; x < availableMigrations.length; x++) {
    newMigrations.push({ migration: availableMigrations[x], index: x })
  }

  for (const { migration, index } of newMigrations) {
    await migration.run(db, index)
    await insertLastMigrationId(db, index)
  }

  debug('Migrations finished.')
}
