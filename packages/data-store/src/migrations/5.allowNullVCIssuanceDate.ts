import { MigrationInterface, QueryRunner } from 'typeorm'
import { Claim, Credential } from '../index.js'
import Debug from 'debug'
import { migrationGetExistingTableByName } from './migration-functions.js'

const debug = Debug('veramo:data-store:migrate-credentials-issuance-date')

/**
 * Reduce issuanceDate constraint of Credential and Claim entities.
 *
 * @public
 */
export class AllowNullIssuanceDateForCredentials1697194289809 implements MigrationInterface {
  name = 'AllowNullIssuanceDateForCredentials1697194289809' // Used in case this class gets minified, which would
  // change the classname

  async up(queryRunner: QueryRunner): Promise<void> {
    if (queryRunner.connection.driver.options.type === 'sqlite') {
      debug(`splitting migration into multiple transactions to allow sqlite table updates`)
      await queryRunner.commitTransaction()
      debug(`turning off foreign keys`)
      await queryRunner.query('PRAGMA foreign_keys=off')
      await queryRunner.startTransaction()
    }

    // update issuanceDate column for credentials
    {
      const table = migrationGetExistingTableByName(queryRunner, 'credential')
      const oldColumn = table?.findColumnByName('issuanceDate')!
      const newColumn = oldColumn.clone()
      newColumn.isNullable = true
      debug(`updating issuanceDate for credentials to allow null`)
      await queryRunner.changeColumn(table!, oldColumn, newColumn)
      debug(`updated issuanceDate for credentials to allow null`)
    }

    // update issuanceDate column for claims
    {
      const table = migrationGetExistingTableByName(queryRunner, 'claim')
      const oldColumn = table?.findColumnByName('issuanceDate')!
      const newColumn = oldColumn.clone()
      newColumn.isNullable = true
      debug(`updating issuanceDate for credential claims to allow null`)
      await queryRunner.changeColumn(table!, oldColumn, newColumn)
      debug(`updated issuanceDate for credential claims to allow null`)
    }

    if (queryRunner.connection.driver.options.type === 'sqlite') {
      debug(`splitting migration into multiple transactions to allow sqlite table updates`)
      await queryRunner.commitTransaction()
      debug(`turning on foreign keys`)
      await queryRunner.query('PRAGMA foreign_keys=on')
      await queryRunner.startTransaction()
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    if (queryRunner.connection.driver.options.type === 'sqlite') {
      debug(`splitting migration into multiple transactions to allow sqlite table updates`)
      await queryRunner.commitTransaction()
      debug(`turning off foreign keys`)
      await queryRunner.query('PRAGMA foreign_keys=off')
      await queryRunner.startTransaction()
    }

    // update issuanceDate column for credential table
    {
      const table = migrationGetExistingTableByName(queryRunner, 'credential')
      debug(`DOWN update NULL 'issuanceDate' with FAKE data for '${table.name}' table`)
      await queryRunner.manager
        .createQueryBuilder()
        .update(Credential)
        .set({ issuanceDate: new Date(0) })
        .where('issuanceDate is NULL')
        .execute()
      // update issuanceDate column

      const oldColumn = table?.findColumnByName('issuanceDate')!
      const newColumn = oldColumn.clone()
      newColumn.isNullable = false
      debug(`updating issuanceDate for credentials to NOT allow null`)
      await queryRunner.changeColumn(table!, oldColumn, newColumn)
      debug(`updated issuanceDate for credentials to NOT allow null`)
    }

    // update issuanceDate for claim table
    {
      const table = migrationGetExistingTableByName(queryRunner, 'claim')
      debug(`DOWN update NULL 'issuanceDate' with FAKE data for '${table.name}' table`)
      await queryRunner.manager
        .createQueryBuilder()
        .update(Claim)
        .set({ issuanceDate: new Date(0) })
        .where('issuanceDate is NULL')
        .execute()
      // update issuanceDate column

      const oldColumn = table?.findColumnByName('issuanceDate')!
      const newColumn = oldColumn.clone()
      newColumn.isNullable = false
      debug(`updating issuanceDate for credential claims to NOT allow null`)
      await queryRunner.changeColumn(table!, oldColumn, newColumn)
      debug(`updated issuanceDate for credential claims to NOT allow null`)
    }

    if (queryRunner.connection.driver.options.type === 'sqlite') {
      debug(`splitting migration into multiple transactions to allow sqlite table updates`)
      await queryRunner.commitTransaction()
      debug(`turning on foreign keys`)
      await queryRunner.query('PRAGMA foreign_keys=on')
      await queryRunner.startTransaction()
    }

    debug(`DOWN updated issuanceDate for credentials to NOT allow null`)
  }
}
