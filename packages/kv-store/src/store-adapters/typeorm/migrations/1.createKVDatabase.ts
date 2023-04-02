import { MigrationInterface, QueryRunner, Table } from 'typeorm'
import Debug from 'debug'
const debug = Debug('veramo:data-store:initial-migration')

/**
 * Create the database layout for Veramo 3.0
 *
 * @public
 */
export class CreateKVDatabaseMigration implements MigrationInterface {
  private readonly _tableName: string
  readonly name: string

  constructor(tableName?: string) {
    this._tableName = tableName || 'keyvaluestore'
    this.name = `CreateKVDatabase${tableName}1680297189001`
  }

  async up(queryRunner: QueryRunner): Promise<void> {
    function getTableName(givenName: string): string {
      return (
        queryRunner.connection.entityMetadatas.find((meta) => meta.givenTableName === givenName)?.tableName ||
        givenName
      )
    }

    debug(`creating ${this._tableName} table`)
    // CREATE TABLE "keyvaluestore" ("key" varchar PRIMARY KEY NOT NULL, "data" text NOT NULL)
    await queryRunner.createTable(
      new Table({
        name: getTableName(this._tableName),
        columns: [
          { name: 'key', type: 'varchar', isPrimary: true },
          { name: 'data', type: 'text', isNullable: false },
        ],
        indices: [
          {
            columnNames: ['key'],
            isUnique: true,
          },
        ],
      }),
      true,
    )
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    throw new Error('illegal_operation: cannot roll back initial migration')
  }
}
