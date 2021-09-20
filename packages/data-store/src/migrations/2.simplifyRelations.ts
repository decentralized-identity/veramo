import { MigrationInterface, QueryRunner, Table, TableColumn } from 'typeorm'
import Debug from 'debug'
const debug = Debug('veramo:data-store:initial-migration')

/**
 * Fix inconsistencies between Entity data and column data
 */
export class SimplifyRelations1447159020002 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn("key", "identifierDid", new TableColumn({ name: 'identifierDid', type: 'varchar', isNullable: true }))
    await queryRunner.changeColumn("service", "identifierDid", new TableColumn({ name: 'identifierDid', type: 'varchar', isNullable: true }))
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    throw new Error('illegal_operation: cannot roll back initial migration')
  }
}
