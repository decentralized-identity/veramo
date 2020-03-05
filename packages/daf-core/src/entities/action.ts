import { Entity, Column, BaseEntity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Identity } from './identity'

@Entity()
export class Action extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: string

  @Column()
  type: string

  @ManyToOne(
    type => Identity,
    identity => identity.actions,
  )
  identity: Identity

  @Column()
  timestamp: number

  @Column()
  data: string
}
