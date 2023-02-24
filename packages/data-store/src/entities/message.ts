import {
  BaseEntity,
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryColumn,
  Relation,
} from 'typeorm'
import { IMessage } from '@veramo/core-types'
import { Identifier } from './identifier.js'
import { createPresentationEntity, Presentation } from './presentation.js'
import { createCredentialEntity, Credential } from './credential.js'
import { computeEntryHash } from '@veramo/utils'
import { v4 as uuidv4 } from 'uuid'

/**
 * Represents message metadata as it is stored by {@link @veramo/data-store#DataStore | DataStore}.
 *
 * This metadata is most often used by {@link @veramo/message-handler#MessageHandler | MessageHandler} and
 * {@link @veramo/core-types#IMessageHandler | IMessageHandler} implementations to decorate messages that are interpreted and
 * decoded, but not returned as final, as they pass through the message handler chain.
 *
 * @beta - This API may change without a BREAKING CHANGE notice.
 */
export interface MetaData {
  type: string
  value?: string
}

/**
 * Represents some common properties of an {@link @veramo/core-types#IMessage} that are stored in a TypeORM database for
 * querying.
 *
 * @see {@link @veramo/core-types#IDataStoreORM.dataStoreORMGetMessages | dataStoreORMGetMessages}
 *   for the interface defining how this can be queried
 *
 * @see {@link @veramo/data-store#DataStoreORM | DataStoreORM} for the implementation of the query interface.
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
@Entity('message')
export class Message extends BaseEntity {
  @BeforeInsert()
  setId() {
    if (!this.id) {
      this.id = computeEntryHash(this.raw || uuidv4())
    }
  }

  @PrimaryColumn()
  // @ts-ignore
  id: string

  @BeforeInsert()
  setSaveDate() {
    this.saveDate = new Date()
    this.updateDate = new Date()
  }

  @BeforeUpdate()
  setUpdateDate() {
    this.updateDate = new Date()
  }

  @Column({ select: false })
  // @ts-ignore
  saveDate: Date

  @Column({ select: false })
  // @ts-ignore
  updateDate: Date

  @Column({ nullable: true })
  createdAt?: Date

  @Column({ nullable: true })
  expiresAt?: Date

  @Column({ nullable: true })
  threadId?: string

  @Column()
  // @ts-ignore
  type: string

  @Column({ nullable: true })
  raw?: string

  @Column('simple-json', { nullable: true })
  data?: object | null

  // https://github.com/decentralized-identifier/didcomm-messaging/blob/41f35f992275dd71d459504d14eb8d70b4185533/jwm.md#jwm-profile

  @Column('simple-array', { nullable: true })
  replyTo?: string[]

  @Column({ nullable: true })
  replyUrl?: string

  @ManyToOne((type) => Identifier, (identifier) => identifier.sentMessages, {
    nullable: true,
    cascade: ['insert'],
    eager: true,
    onDelete: 'CASCADE',
  })
  from?: Relation<Identifier>

  @ManyToOne((type) => Identifier, (identifier) => identifier.receivedMessages, {
    nullable: true,
    cascade: ['insert'],
    eager: true,
    onDelete: 'CASCADE',
  })
  to?: Relation<Identifier>

  @Column('simple-json', { nullable: true })
  metaData?: MetaData[] | null

  @ManyToMany((type) => Presentation, (presentation) => presentation.messages, {
    cascade: true,
  })
  @JoinTable()
  // @ts-ignore
  presentations: Relation<Presentation[]>

  @ManyToMany((type) => Credential, (credential) => credential.messages, { cascade: true })
  @JoinTable()
  // @ts-ignore
  credentials: Relation<Credential[]>
}

export const createMessageEntity = (args: IMessage): Message => {
  const message = new Message()
  message.id = args.id
  message.threadId = args.threadId
  message.type = args.type
  message.raw = args.raw
  message.data = args.data
  message.metaData = args.metaData

  if (args.replyTo) {
    message.replyTo = args.replyTo
  }
  if (args.replyUrl) {
    message.replyUrl = args.replyUrl
  }

  if (args.createdAt) {
    message.createdAt = new Date(args.createdAt)
  }

  if (args.expiresAt) {
    message.createdAt = new Date(args.expiresAt)
  }

  if (args.from) {
    const from = new Identifier()
    from.did = args.from
    message.from = from
  }

  if (args.to) {
    const to = new Identifier()
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

export const createMessage = (args: Message): IMessage => {
  const message: Partial<IMessage> = {
    id: args.id,
    type: args.type,
    raw: args.raw,
    data: args.data,
    metaData: args.metaData,
  }

  if (args.threadId) {
    message.threadId = args.threadId
  }

  if (args.replyTo) {
    message.replyTo = args.replyTo
  }

  if (args.replyTo) {
    message.replyUrl = args.replyUrl
  }

  if (args.createdAt) {
    message.createdAt = args.createdAt.toISOString()
  }

  if (args.expiresAt) {
    message.expiresAt = args.expiresAt.toISOString()
  }

  if (args.from) {
    message.from = args.from.did
  }

  if (args.to) {
    message.to = args.to.did
  }

  if (args.presentations) {
    message.presentations = args.presentations.map((vp) => vp.raw)
  }

  if (args.credentials) {
    message.credentials = args.credentials.map((vc) => vc.raw)
  }

  return message as IMessage
}
