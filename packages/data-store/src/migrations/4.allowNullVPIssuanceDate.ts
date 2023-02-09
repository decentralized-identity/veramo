import { MigrationInterface, QueryRunner } from 'typeorm'
import { Presentation } from '../index.js'
import Debug from 'debug'

const debug = Debug('veramo:data-store:migrate-presentation-issuance-date')

/**
 * Reduce issuanceDate constraint of Presentations.
 *
 * @public
 */
export class AllowNullIssuanceDateForPresentations1637237492913 implements MigrationInterface {
  private getTableName(givenName: string, queryRunner: QueryRunner): string {
    return (
      queryRunner.connection.entityMetadatas.find((meta) => meta.givenTableName === givenName)?.tableName ||
      givenName
    )
  }

  async up(queryRunner: QueryRunner): Promise<void> {
    if (queryRunner.connection.driver.options.type === 'sqlite') {
      debug(`splitting migration into multiple transactions to allow sqlite table updates`)
      await queryRunner.commitTransaction()
      debug(`turning off foreign keys`)
      await queryRunner.query('PRAGMA foreign_keys=off')
      await queryRunner.startTransaction()
    }

    const tableName = this.getTableName('presentation', queryRunner)
    // update issuanceDate column
    let table = await queryRunner.getTable(tableName)
    const oldColumn = table?.findColumnByName('issuanceDate')!
    const newColumn = oldColumn.clone()
    newColumn.isNullable = true
    debug(`updating issuanceDate for presentations to allow null`)
    await queryRunner.changeColumn(table!, oldColumn, newColumn)
    debug(`updated issuanceDate for presentations to allow null`)

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
    const tableName = this.getTableName('presentation', queryRunner)
    debug(`DOWN update NULL 'issuanceDate' with FAKE data for '${tableName}' table`)
    await queryRunner.manager
      .createQueryBuilder()
      .update(Presentation)
      .set({ issuanceDate: new Date(0) })
      .where('issuanceDate is NULL')
      .execute()
    // update issuanceDate column
    let table = await queryRunner.getTable(tableName)
    const oldColumn = table?.findColumnByName('issuanceDate')!
    const newColumn = oldColumn.clone()
    newColumn.isNullable = false
    debug(`updating issuanceDate for presentations to NOT allow null`)
    await queryRunner.changeColumn(table!, oldColumn, newColumn)
    debug(`updated issuanceDate for presentations to NOT allow null`)

    if (queryRunner.connection.driver.options.type === 'sqlite') {
      debug(`splitting migration into multiple transactions to allow sqlite table updates`)
      await queryRunner.commitTransaction()
      debug(`turning on foreign keys`)
      await queryRunner.query('PRAGMA foreign_keys=on')
      await queryRunner.startTransaction()
    }

    debug(`DOWN updated issuanceDate for presentations to NOT allow null`)
  }
}
