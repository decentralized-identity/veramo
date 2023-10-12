import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

@Entity('recipient_did')
export class RecipientDid {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  did!: string

  @Column()
  recipient_did!: string
}
