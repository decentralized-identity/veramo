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
} from 'typeorm'
import { Identity } from './identity'
import { Presentation } from './presentation'
import { Credential } from './credential'

export interface MetaData {
  type: string
  value?: string
}

@Entity()
export class Message extends BaseEntity {
  constructor(data?: { raw: string; meta?: { type: string; value?: string } }) {
    super()
    if (data?.raw) {
      this.raw = data.raw
    }
    if (data?.meta) {
      this.addMetaData(data.meta)
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
    },
  )
  from?: Identity

  @ManyToOne(
    type => Identity,
    identity => identity.receivedMessages,
    {
      nullable: true,
      cascade: ['insert'],
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

  @ManyToMany(type => Credential, {
    cascade: true,
  })
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
