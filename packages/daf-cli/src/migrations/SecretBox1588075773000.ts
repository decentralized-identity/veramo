import { MigrationInterface, QueryRunner } from 'typeorm'
import { Key } from 'daf-core'
import { SecretBox } from 'daf-libsodium'

export class SecretBox1588075773000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    const exists = await queryRunner.hasTable('key')
    if (exists) {
      const secretBox = new SecretBox(process.env.DAF_SECRET_KEY)
      const keys = await queryRunner.connection.getRepository(Key).find()
      for (const key of keys) {
        key.privateKeyHex = await secretBox.encrypt(key.privateKeyHex)
        await key.save()
      }
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    const exists = await queryRunner.hasTable('key')
    if (exists) {
      const secretBox = new SecretBox(process.env.DAF_SECRET_KEY)
      const keys = await queryRunner.connection.getRepository(Key).find()
      for (const key of keys) {
        key.privateKeyHex = await secretBox.decrypt(key.privateKeyHex)
        await key.save()
      }
    }
  }
}
