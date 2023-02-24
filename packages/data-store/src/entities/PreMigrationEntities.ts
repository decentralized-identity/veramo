import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm'
import { KeyType } from "./key.js";

/**
 * This represents the private key data of keys that were stored by {@link @veramo/data-store#KeyStore} before Veramo
 * 3.0. During database migration this key material is moved to a different table and accessible by
 * {@link @veramo/data-store#PrivateKeyStore}.
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
@Entity('key')
export class PreMigrationKey extends BaseEntity {
  @PrimaryColumn()
    // @ts-ignore
  kid: string

  @Column()
    // @ts-ignore
  type: KeyType

  @Column({ nullable: true })
  privateKeyHex?: string
}
