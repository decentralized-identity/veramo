import { KeyMetadata, TKeyType } from '@veramo/core-types'
import { Entity, Column, PrimaryColumn, BaseEntity, ManyToOne, Relation } from 'typeorm'
import { Identifier } from './identifier.js'

/**
 * Mirrors {@link @veramo/core-types#TKeyType | TKeyType}
 *
 * @beta - This API may change without a BREAKING CHANGE notice.
 */
export type KeyType = TKeyType

/**
 * Represents some properties of a {@link @veramo/core-types#IKey | IKey} that are stored in a TypeORM
 * database for the purpose of keeping track of the {@link @veramo/key-manager#AbstractKeyManagementSystem}
 * implementations and the keys they are able to use.
 *
 * @see {@link @veramo/data-store#KeyStore | KeyStore} for the implementation used by the
 *   {@link @veramo/key-manager#KeyManager | KeyManager}.
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
@Entity('key')
export class Key extends BaseEntity {
  @PrimaryColumn()
  // @ts-ignore
  kid: string

  @Column()
  // @ts-ignore
  kms: string

  @Column()
  // @ts-ignore
  type: KeyType

  @Column()
  // @ts-ignore
  publicKeyHex: string

  @Column({
    type: 'simple-json',
    nullable: true,
    transformer: {
      to: (value: any): KeyMetadata | null => {
        return value
      },
      from: (value: KeyMetadata | null): object | null => {
        return value
      },
    },
  })
  meta?: KeyMetadata | null

  @ManyToOne((type) => Identifier, (identifier) => identifier?.keys, { onDelete: 'CASCADE' })
  identifier?: Relation<Identifier>
}
