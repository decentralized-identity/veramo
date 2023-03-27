import { QueryRunner, Table } from 'typeorm'

/**
 * Get an existing table by name. Checks against givenTableName first, and tableName next. Throws an error if not found
 *
 * @param queryRunner The query runner object to use for querying
 * @param givenName The given name of the table to search for
 *
 * @public
 */
export function migrationGetExistingTableByName(queryRunner: QueryRunner, givenName: string): Table {
  const table = migrationGetTableByNameImpl(queryRunner, givenName)
  if (!table) {
    throw Error(`Could not find table with name ${givenName}`)
  }
  return table
}

/**
 * Get an existing table by name. Checks against givenTableName first, and tableName next. Returns undefined if not found
 *
 * @param queryRunner The query runner object to use for querying
 * @param givenName The given name of the table to search for
 *
 * @private
 */
function migrationGetTableByNameImpl(queryRunner: QueryRunner, givenName: string): Table | undefined {
  let entityMetadata = queryRunner.connection.entityMetadatas.find((meta) => meta.givenTableName === givenName)
  if (!entityMetadata) {
    // We are doing this separately as we don't want the above filter to use an or expression potentially matching first on tableName instead of givenTableName
    entityMetadata = queryRunner.connection.entityMetadatas.find((meta) => meta.tableName === givenName)
  }

  return entityMetadata ? Table.create(entityMetadata, queryRunner.connection.driver) : undefined
}

/**
 * Get a table name. Checks against givenTableName first, and tableName next from existing tables. Then returns the name. If not found returns the givenName argument
 *
 * @param queryRunner The query runner object to use for querying
 * @param givenName The given name of the table to search for
 *
 * @public
 */
export function migrationGetTableName(queryRunner: QueryRunner, givenName: string): string {
  const table = migrationGetTableByNameImpl(queryRunner, givenName)
  return !!table ? table.name : givenName
}
