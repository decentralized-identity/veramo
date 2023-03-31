import { QueryRunner, Table } from 'typeorm'

/**
 * Get an existing table by name. Checks against givenTableName first, and tableName next. Throws an error if not found
 *
 * @param queryRunner The query runner object to use for querying
 * @param givenName The given name of the table to search for
 * @param strictClassName Whether the table name should strictly match the given name
 *
 * @public
 */
export function migrationGetExistingTableByName(queryRunner: QueryRunner, givenName: string, strictClassName?: boolean): Table {
  const table = migrationGetTableByNameImpl(queryRunner, givenName, strictClassName)
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
 * @param strictClassName Whether the table name should strictly match the given name
 *
 * @private
 */
function migrationGetTableByNameImpl(queryRunner: QueryRunner, givenName: string, strictClassName?: boolean): Table | undefined {
  let entityMetadata = queryRunner.connection.entityMetadatas.find((meta) => !!strictClassName ? meta.name === givenName : meta.givenTableName === givenName)
  if (!entityMetadata && !strictClassName) {
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
 * @param strictClassName Whether the table name should strictly match the given name
 * @public
 */
export function migrationGetTableName(queryRunner: QueryRunner, givenName: string, strictClassName?: boolean): string {
  const table = migrationGetTableByNameImpl(queryRunner, givenName, strictClassName)
  return !!table ? table.name : givenName
}
