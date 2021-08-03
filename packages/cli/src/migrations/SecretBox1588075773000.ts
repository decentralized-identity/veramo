import { MigrationInterface, QueryRunner } from 'typeorm'
import { Key } from '@veramo/data-store'
import { SecretBox } from '@veramo/kms-local'

export class SecretBox1588075773000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    const exists = await queryRunner.hasTable('key')
    if (exists && process.env.VERAMO_SECRET_KEY) {
      const secretBox = new SecretBox(process.env.VERAMO_SECRET_KEY)
      const keys = await queryRunner.connection.getRepository(Key).find()
      for (const key of keys) {
        if ((<any>key).privateKeyHex) {
          (<any>key).privateKeyHex = await secretBox.encrypt((<any>key).privateKeyHex)
        }
        await key.save()
      }
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    const exists = await queryRunner.hasTable('key')
    if (exists && process.env.VERAMO_SECRET_KEY) {
      const secretBox = new SecretBox(process.env.VERAMO_SECRET_KEY)
      const keys = await queryRunner.connection.getRepository(Key).find()
      for (const key of keys) {
        if ((<any>key).privateKeyHex) {
          (<any>key).privateKeyHex = await secretBox.decrypt((<any>key).privateKeyHex)
        }
        await key.save()
      }
    }
  }
}
