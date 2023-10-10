import { Entity, PrimaryGeneratedColumn, Column, Relation, ManyToOne } from 'typeorm'
import { Identifier } from './identifier.js'

@Entity('recipient_did')
export class RecipientDid {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  recipient_did!: string
}
