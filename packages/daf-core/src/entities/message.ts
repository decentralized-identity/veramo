import {
  Entity,
  Column,
  BaseEntity,
  ManyToOne,
  ManyToMany,
  PrimaryGeneratedColumn,
  OneToMany,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm'
import { Identity } from './identity'
import { MessageMetaData } from './message-meta-data'
import { Presentation } from './presentation'
import { Credential } from './credential'

@Entity()
export class Message extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: string

  @CreateDateColumn()
  saveDate: Date

  @UpdateDateColumn()
  updateDate: Date

  @Column({ nullable: true })
  createdAt?: Date

  @Column({ nullable: true })
  expiresAt?: Date

  @Column({ nullable: true })
  threadId?: string

  @Column()
  type: string

  @Column()
  raw: string

  @Column('simple-json', { nullable: true })
  data?: object

  // https://github.com/decentralized-identity/didcomm-messaging/blob/41f35f992275dd71d459504d14eb8d70b4185533/jwm.md#jwm-profile

  @Column('simple-array', { nullable: true })
  replyTo?: string[]

  @Column({ nullable: true })
  replyUrl?: string

  @ManyToOne(
    type => Identity,
    identity => identity.sentMessages,
    {
      nullable: true,
      cascade: ['insert'],
    },
  )
  from?: Identity

  @ManyToMany(
    type => Identity,
    identity => identity.receivedMessages,
    {
      nullable: true,
      cascade: ['insert'],
    },
  )
  @JoinTable()
  to?: Identity[]

  @OneToMany(
    type => MessageMetaData,
    messageMetaData => messageMetaData.message,
    {
      cascade: true,
    },
  )
  metaData: MessageMetaData[]

  @ManyToMany(
    type => Presentation,
    presentation => presentation.messages,
    {
      cascade: true,
    },
  )
  @JoinTable()
  presentations: Presentation[]

  @ManyToMany(
    type => Credential,
    credential => credential.messages,
    {
      cascade: true,
    },
  )
  @JoinTable()
  credentials: Credential[]
}
