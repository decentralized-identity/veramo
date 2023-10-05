import { Entity, PrimaryGeneratedColumn, Column, Relation, ManyToOne } from 'typeorm'
import { Identifier } from './identifier.js'

@Entity('recipient_did')
export class RecipientDID {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  recipient_did!: string

  @ManyToOne(() => Identifier, (identifier) => identifier?.recipient_dids, { onDelete: 'CASCADE' })
  identifier?: Relation<Identifier>
}
