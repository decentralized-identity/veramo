import {
  Entity,
  Column,
  BaseEntity,
  ManyToOne,
  ManyToMany,
  PrimaryColumn,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
} from 'typeorm'
import { blake2bHex } from 'blakejs'
import { IMessage } from 'daf-core'
import { Identity } from './identity'
import { Presentation, createPresentationEntity } from './presentation'
import { Credential, createCredentialEntity } from './credential'

export interface MetaData {
  type: string
  value?: string
}

@Entity()
export class Message extends BaseEntity {

  @BeforeInsert()
  setId() {
    if (!this.id) {
      this.id = blake2bHex(this.raw)
    }
  }

  @PrimaryColumn()
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

  @Column({ nullable: true })
  raw?: string

  @Column('simple-json', { nullable: true })
  data?: any

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
      eager: true,
    },
  )
  from?: Identity

  @ManyToOne(
    type => Identity,
    identity => identity.receivedMessages,
    {
      nullable: true,
      cascade: ['insert'],
      eager: true,
    },
  )
  to?: Identity

  @Column('simple-json', { nullable: true })
  metaData?: MetaData[]

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
    { cascade: true },
  )
  @JoinTable()
  credentials: Credential[]

  addMetaData(meta: MetaData) {
    if (this.metaData) {
      this.metaData.push(meta)
    } else {
      this.metaData = [meta]
    }
  }

  getLastMetaData(): MetaData | null {
    if (this.metaData?.length > 0) {
      return this.metaData[this.metaData.length - 1]
    } else {
      return null
    }
  }

  isValid() {
    if (this.type === null || this.type === '') {
      return false
    }
    if (!this.raw || this.raw === null || this.raw === '') {
      return false
    }
    return true
  }
}

export const createMessageEntity = ( args: IMessage ): Message => {
  const message = new Message()
  message.id = args.id
  message.threadId = args.threadId
  message.type = args.type
  message.raw = args.raw
  message.data = args.data
  message.replyTo = args.replyTo
  message.replyUrl = args.replyUrl
  message.metaData = args.metaData

  if (args.createdAt) {
    message.createdAt = new Date(args.createdAt)
  }

  if (args.expiresAt) {
    message.createdAt = new Date(args.expiresAt)
  }

  if (args.from) {
    const from = new Identity()
    from.did = args.from
    message.from = from
  }

  if (args.to) {
    const to = new Identity()
    to.did = args.to
    message.to = to
  }

  if (args.presentations) {
    message.presentations = args.presentations.map(createPresentationEntity)
  }

  if (args.credentials) {
    message.credentials = args.credentials.map(createCredentialEntity)
  }

  return message
}