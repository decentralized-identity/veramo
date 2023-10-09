import { Entity, BaseEntity, Column, PrimaryGeneratedColumn } from 'typeorm'

@Entity('recipient_did')
export class RecipientDid extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column()
  did!: string

  @Column()
  recipient_did!: string
}
