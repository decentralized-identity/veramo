import { Entity, PrimaryGeneratedColumn, Column, PrimaryColumn } from 'typeorm'

@Entity('recipient_did')
export class RecipientDid {
  @PrimaryColumn()
  did!: string

  @Column()
  recipient_did!: string
}
