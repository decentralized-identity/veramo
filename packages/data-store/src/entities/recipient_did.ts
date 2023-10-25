import { Entity, BaseEntity, Column, PrimaryGeneratedColumn } from 'typeorm'

/**
 * @beta This API may change without a BREAKING CHANGE notice.
 */
@Entity('recipient_did')
export class RecipientDid extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column()
  did!: string

  @Column()
  recipient_did!: string
}
