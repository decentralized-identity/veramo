import { CreateKVDatabaseMigration } from './1.createKVDatabase.js'

/**
 * The migrations array that SHOULD be used when initializing a TypeORM database connection.
 *
 * These ensure the correct creation of tables and the proper migrations of data when tables change between versions.
 *
 * @public
 */
export const kvStoreMigrations = [CreateKVDatabaseMigration]
