import {MigrationInterface, QueryRunner } from "typeorm";

export class CredentialStatus1587985317000 implements MigrationInterface {

  async up(queryRunner: QueryRunner): Promise<void> {
    if (!queryRunner.hasColumn('credential', 'credentialStatus')) {
      await queryRunner.query('ALTER TABLE credential ADD credentialStatus TEXT NULL')
    }
  }
  
  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE credential DROP credentialStatus')
  }
  
}