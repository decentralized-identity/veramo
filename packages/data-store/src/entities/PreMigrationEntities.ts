import { Column, Entity, PrimaryColumn } from 'typeorm'
import { Key } from './key.js'

/**
 * This represents the private key data of keys that were stored by {@link @veramo/data-store#KeyStore} before Veramo
 * 3.0. During database migration this key material is moved to a different table and accessible by
 * {@link @veramo/data-store#PrivateKeyStore}.
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
@Entity('key', )
export class PreMigrationKey extends Key {
  // Key contains all the other columns present needed for successful migrations

  @PrimaryColumn()
    // @ts-ignore
  kid: string

  @Column({ nullable: true })
  privateKeyHex?: string
}
