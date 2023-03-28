import { MigrationInterface, QueryRunner, Table, TableColumn } from 'typeorm'
import { PrivateKey } from '../index.js'
import { PreMigrationKey } from '../entities/PreMigrationEntities.js'
import Debug from 'debug'
import { migrationGetExistingTableByName, migrationGetTableName } from './migration-functions.js'

const debug = Debug('veramo:data-store:migrate-private-keys')

/**
 * Migration of existing private keys from Veramo 2.x to Veramo 3.x
 *
 * @public
 */
export class CreatePrivateKeyStorage1629293428674 implements MigrationInterface {

  name = 'CreatePrivateKeyStorage1629293428674' // Used in case this class gets minified, which would change the classname

  async up(queryRunner: QueryRunner): Promise<void> {
    // 1.create new table
    debug(`creating new private-key table`)
    await queryRunner.createTable(
      new Table({
        name: migrationGetTableName(queryRunner, 'private-key'),
        columns: [
          {
            name: 'alias',
            type: 'varchar',
            isPrimary: true,
          },
          {
            name: 'type',
            type: 'varchar',
          },
          {
            name: 'privateKeyHex',
            type: 'varchar',
          },
        ],
      }),
      true,
    )
    // 2. copy key data
    const keys: PreMigrationKey[] = await queryRunner.manager.find(PreMigrationKey)
    debug(`got ${keys.length} potential keys to migrate`)
    const privKeys = keys
      .filter((key) => typeof key.privateKeyHex !== 'undefined' && key.privateKeyHex !== null)
      .map((key) => ({
        alias: key.kid,
        type: key.type,
        privateKeyHex: key.privateKeyHex,
      }))
    debug(`${privKeys.length} keys need to be migrated`)
    await queryRunner.manager
      .createQueryBuilder()
      .insert()
      .into(migrationGetTableName(queryRunner, 'private-key'))
      .values(privKeys)
      .execute()
    // 3. drop old column
    debug(`dropping privKeyHex column from old key table`)
    await queryRunner.dropColumn(migrationGetExistingTableByName(queryRunner, 'PreMigrationKey', true), 'privateKeyHex')
    //4. done
    debug(`migrated ${privKeys.length} keys to private key storage`)

  }

  async down(queryRunner: QueryRunner): Promise<void> {

    // 1. add old column back
    debug(`adding back privateKeyHex column to key table`)
    await queryRunner.addColumn(
      'key',
      new TableColumn({
        name: 'privateKeyHex',
        type: 'varchar',
        isNullable: true,
      }),
    )
    // 2. copy key data
    debug(`checking keys to be rolled back`)
    const keys: PrivateKey[] = await queryRunner.manager.find(PrivateKey)
    debug(`copying ${keys.length} keys`)
    for (const key of keys) {
      await queryRunner.manager
        .createQueryBuilder()
        .update(PreMigrationKey)
        .set({ privateKeyHex: key.privateKeyHex })
        .where('kid = :alias', { alias: key.alias })
        .execute()
    }
    debug(`dropping private-key table`)
    // 3. drop the new private key table
    await queryRunner.dropTable(migrationGetExistingTableByName(queryRunner, 'private-key'))
    // 4. done
    debug(`rolled back ${keys.length} keys`)
  }
}
