import {
  Entity,
  Column,
  BaseEntity,
  ManyToOne,
  ManyToMany,
  PrimaryGeneratedColumn,
  OneToMany,
  JoinTable,
} from 'typeorm'
import { Identity } from './identity'
import { MessageMetaData } from './message-meta-data'
import { Presentation } from './presentation'
import { Credential } from './credential'

@Entity()
export class Message extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: string

  @Column()
  threadId: string

  @Column()
  type: string

  @ManyToOne(
    type => Identity,
    identity => identity.sentMessages,
  )
  sender: Identity

  @ManyToOne(
    type => Identity,
    identity => identity.receivedMessages,
  )
  receiver: Identity

  @Column()
  timestamp: number

  @Column()
  raw: string

  @Column()
  data: string

  @OneToMany(
    type => MessageMetaData,
    messageMetaData => messageMetaData.message,
  )
  metaData: MessageMetaData[]

  @ManyToMany(
    type => Presentation,
    presentation => presentation.messages,
  )
  @JoinTable()
  presentations: Presentation[]

  @ManyToMany(
    type => Credential,
    credential => credential.messages,
  )
  @JoinTable()
  credentials: Credential[]
}
