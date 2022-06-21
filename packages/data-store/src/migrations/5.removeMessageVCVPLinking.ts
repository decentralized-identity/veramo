import { MigrationInterface, QueryRunner, Table } from 'typeorm'
import Debug from 'debug'

const debug = Debug('veramo:data-store:initial-migration')

/**
 * Remove linking between messages and VCs/VPs see
 * {@link https://github.com/uport-project/veramo/issues/834 | github #834}
 *
 * @public
 */
export class RemoveMessageLinking1655806693000 implements MigrationInterface {
  private getTableName(queryRunner: QueryRunner, givenName: string): string {
    return (
      queryRunner.connection.entityMetadatas.find((meta) => meta.givenTableName === givenName)?.tableName ||
      givenName
    )
  }

  async up(queryRunner: QueryRunner): Promise<void> {

    debug(`dropping message_presentations_presentation many to many table`)
    // "CREATE TABLE \"message_presentations_presentation\" (\"messageId\" varchar NOT NULL, \"presentationHash\"
    // varchar NOT NULL, CONSTRAINT \"FK_7e7094f2cd6e5ec93914ac5138f\" FOREIGN KEY (\"messageId\") REFERENCES
    // \"message\" (\"id\") ON DELETE CASCADE ON UPDATE NO ACTION, CONSTRAINT \"FK_a13b5cf828c669e61faf489c182\"
    // FOREIGN KEY (\"presentationHash\") REFERENCES \"presentation\" (\"hash\") ON DELETE CASCADE ON UPDATE NO ACTION,
    // PRIMARY KEY (\"messageId\", \"presentationHash\"))", "CREATE INDEX \"IDX_7e7094f2cd6e5ec93914ac5138\" ON
    // \"message_presentations_presentation\" (\"messageId\")", "CREATE INDEX \"IDX_a13b5cf828c669e61faf489c18\" ON
    // \"message_presentations_presentation\" (\"presentationHash\")",
    await queryRunner.dropTable(this.getTableName(queryRunner, 'message_presentations_presentation'), true, true, true)

    debug(`dropping message_credentials_credential many to many table`)
    // "CREATE TABLE \"message_credentials_credential\" (\"messageId\" varchar NOT NULL, \"credentialHash\" varchar NOT
    // NULL, CONSTRAINT \"FK_1c111357e73db91a08525914b59\" FOREIGN KEY (\"messageId\") REFERENCES \"message\" (\"id\")
    // ON DELETE CASCADE ON UPDATE NO ACTION, CONSTRAINT \"FK_8ae8195a94b667b185d2c023e33\" FOREIGN KEY
    // (\"credentialHash\") REFERENCES \"credential\" (\"hash\") ON DELETE CASCADE ON UPDATE NO ACTION, PRIMARY KEY
    // (\"messageId\", \"credentialHash\"))", "CREATE INDEX \"IDX_1c111357e73db91a08525914b5\" ON
    // \"message_credentials_credential\" (\"messageId\")", "CREATE INDEX \"IDX_8ae8195a94b667b185d2c023e3\" ON
    // \"message_credentials_credential\" (\"credentialHash\")",
    await queryRunner.dropTable(this.getTableName(queryRunner, 'message_credentials_credential'), true, true, true)
  }

  async down(queryRunner: QueryRunner): Promise<void> {

    debug(`creating message_presentations_presentation many to many table`)
    // "CREATE TABLE \"message_presentations_presentation\" (\"messageId\" varchar NOT NULL, \"presentationHash\"
    // varchar NOT NULL, CONSTRAINT \"FK_7e7094f2cd6e5ec93914ac5138f\" FOREIGN KEY (\"messageId\") REFERENCES
    // \"message\" (\"id\") ON DELETE CASCADE ON UPDATE NO ACTION, CONSTRAINT \"FK_a13b5cf828c669e61faf489c182\"
    // FOREIGN KEY (\"presentationHash\") REFERENCES \"presentation\" (\"hash\") ON DELETE CASCADE ON UPDATE NO ACTION,
    // PRIMARY KEY (\"messageId\", \"presentationHash\"))", "CREATE INDEX \"IDX_7e7094f2cd6e5ec93914ac5138\" ON
    // \"message_presentations_presentation\" (\"messageId\")", "CREATE INDEX \"IDX_a13b5cf828c669e61faf489c18\" ON
    // \"message_presentations_presentation\" (\"presentationHash\")",
    await queryRunner.createTable(
      new Table({
        name: this.getTableName(queryRunner, 'message_presentations_presentation'),
        columns: [
          { name: 'messageId', type: 'varchar', isPrimary: true },
          { name: 'presentationHash', type: 'varchar', isPrimary: true },
        ],
        indices: [
          {
            columnNames: ['messageId', 'presentationHash'],
          },
        ],
        foreignKeys: [
          {
            columnNames: ['messageId'],
            referencedColumnNames: ['id'],
            referencedTableName: this.getTableName(queryRunner, 'message'),
            onDelete: 'cascade',
          },
          {
            columnNames: ['presentationHash'],
            referencedColumnNames: ['hash'],
            referencedTableName: this.getTableName(queryRunner, 'presentation'),
            onDelete: 'cascade',
          },
        ],
      }),
      true,
    )

    debug(`creating message_credentials_credential many to many table`)
    // "CREATE TABLE \"message_credentials_credential\" (\"messageId\" varchar NOT NULL, \"credentialHash\" varchar NOT
    // NULL, CONSTRAINT \"FK_1c111357e73db91a08525914b59\" FOREIGN KEY (\"messageId\") REFERENCES \"message\" (\"id\")
    // ON DELETE CASCADE ON UPDATE NO ACTION, CONSTRAINT \"FK_8ae8195a94b667b185d2c023e33\" FOREIGN KEY
    // (\"credentialHash\") REFERENCES \"credential\" (\"hash\") ON DELETE CASCADE ON UPDATE NO ACTION, PRIMARY KEY
    // (\"messageId\", \"credentialHash\"))", "CREATE INDEX \"IDX_1c111357e73db91a08525914b5\" ON
    // \"message_credentials_credential\" (\"messageId\")", "CREATE INDEX \"IDX_8ae8195a94b667b185d2c023e3\" ON
    // \"message_credentials_credential\" (\"credentialHash\")",
    await queryRunner.createTable(
      new Table({
        name: this.getTableName(queryRunner, 'message_credentials_credential'),
        columns: [
          { name: 'messageId', type: 'varchar', isPrimary: true },
          { name: 'credentialHash', type: 'varchar', isPrimary: true },
        ],
        indices: [
          {
            columnNames: ['messageId', 'credentialHash'],
          },
        ],
        foreignKeys: [
          {
            columnNames: ['messageId'],
            referencedColumnNames: ['id'],
            referencedTableName: this.getTableName(queryRunner, 'message'),
            onDelete: 'cascade',
          },
          {
            columnNames: ['credentialHash'],
            referencedColumnNames: ['hash'],
            referencedTableName: this.getTableName(queryRunner, 'credential'),
            onDelete: 'cascade',
          },
        ],
      }),
      true,
    )
  }
}
