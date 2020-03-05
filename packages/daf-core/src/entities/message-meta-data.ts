import { Entity, Column, BaseEntity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Message } from './message'

@Entity()
export class MessageMetaData extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: string

  @Column()
  type: string

  @Column()
  value: string

  @ManyToOne(
    type => Message,
    message => message.metaData,
  )
  message: Message

  @Column()
  timestamp: number
}
