import { MigrationInterface, QueryRunner } from 'typeorm'

export class CredentialStatus1587985317000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    const tableExists = await queryRunner.hasTable('credential')
    if (tableExists) {
      const columnExists = await queryRunner.hasColumn('credential', 'credentialStatus')
      if (!columnExists) {
        await queryRunner.query('ALTER TABLE credential ADD credentialStatus TEXT NULL')
      }
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    const tableExists = await queryRunner.hasTable('credential')
    if (tableExists) {
      const columnExists = await queryRunner.hasColumn('credential', 'credentialStatus')
      if (columnExists) {
        await queryRunner.query('ALTER TABLE credential DROP credentialStatus')
      }
    }
  }
}
