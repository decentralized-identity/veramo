import { blake2bHex } from 'blakejs'
import {
  Entity,
  Column,
  BaseEntity,
  ManyToOne,
  JoinTable,
  PrimaryColumn,
  BeforeInsert,
  ManyToMany,
} from 'typeorm'
import { Identity } from './identity'
import { Message } from './message'
import { Credential } from './credential'

@Entity()
export class Presentation extends BaseEntity {
  @PrimaryColumn()
  hash: string

  setRaw(raw: string) {
    this.raw = raw
    this.hash = blake2bHex(this.raw)
  }

  @ManyToOne(
    type => Identity,
    identity => identity.issuedPresentations,
    {
      cascade: ['insert'],
    },
  )
  issuer: Identity

  @ManyToOne(
    type => Identity,
    identity => identity.receivedPresentations,
    {
      cascade: ['insert'],
    },
  )
  audience: Identity

  @Column({ nullable: true })
  issuedAt?: Date

  @Column({ nullable: true })
  notBefore?: Date

  @Column({ nullable: true })
  expiresAt?: Date

  @Column()
  raw: string

  context: string[]

  type: string[]

  @ManyToMany(
    type => Credential,
    credential => credential.presentations,
    {
      cascade: true,
    },
  )
  @JoinTable()
  credentials: Credential[]

  @ManyToMany(
    type => Message,
    message => message.presentations,
  )
  messages: Message[]
}
