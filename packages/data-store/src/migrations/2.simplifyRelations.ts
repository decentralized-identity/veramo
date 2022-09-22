import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm'
import Debug from 'debug'

/**
 * Fix inconsistencies between Entity data and column data.
 *
 * @public
 */
export class SimplifyRelations1447159020002 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    function getTableName(givenName: string): string {
      return (
        queryRunner.connection.entityMetadatas.find((meta) => meta.givenTableName === givenName)?.tableName ||
        givenName
      )
    }
    await queryRunner.changeColumn(
      getTableName('key'),
      'identifierDid',
      new TableColumn({ name: 'identifierDid', type: 'varchar', isNullable: true }),
    )
    await queryRunner.changeColumn(
      getTableName('service'),
      'identifierDid',
      new TableColumn({ name: 'identifierDid', type: 'varchar', isNullable: true }),
    )
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    throw new Error('illegal_operation: cannot roll back initial migration')
  }
}
