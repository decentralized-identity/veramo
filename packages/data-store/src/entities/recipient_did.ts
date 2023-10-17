import { Entity, BaseEntity, Column, PrimaryColumn } from 'typeorm'

@Entity('recipient_did')
export class RecipientDid extends BaseEntity {
  @PrimaryColumn()
  did!: string

  @Column()
  recipient_did!: string
}
