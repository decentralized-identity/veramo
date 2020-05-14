import { MigrationInterface, QueryRunner } from 'typeorm'
import { Key } from 'daf-core'
import { SecretBox } from 'daf-libsodium'

export class SecretBox1588075773000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    const exists = await queryRunner.hasTable('key')
    if (exists) {
      const secretBox = new SecretBox(process.env.DAF_SECRET_KEY || 's3cr3t')
      const keys = await queryRunner.connection.getRepository(Key).find()
      for (const key of keys) {
        if (!key.privateKeyHex) {
          throw new Error('Key has no privateKey')
        }
        key.privateKeyHex = await secretBox.encrypt(key.privateKeyHex)
        await key.save()
      }
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    const exists = await queryRunner.hasTable('key')
    if (exists) {
      const secretBox = new SecretBox(process.env.DAF_SECRET_KEY || 's3cr3t')
      const keys = await queryRunner.connection.getRepository(Key).find()
      for (const key of keys) {
        if (!key.privateKeyHex) {
          throw new Error('Key has no privateKey')
        }
        key.privateKeyHex = await secretBox.decrypt(key.privateKeyHex)
        await key.save()
      }
    }
  }
}
