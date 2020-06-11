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

  private _raw: string

  set raw(raw: string) {
    this._raw = raw
    this.hash = blake2bHex(raw)
  }

  @Column()
  get raw(): string {
    return this._raw
  }

  @ManyToOne(
    type => Identity,
    identity => identity.issuedPresentations,
    {
      cascade: ['insert'],
      eager: true,
    },
  )
  issuer: Identity

  @ManyToMany(
    type => Identity,
    identity => identity.receivedPresentations,
    {
      cascade: ['insert'],
      eager: true,
    },
  )
  @JoinTable()
  audience: Identity[]

  @Column({ nullable: true })
  id?: String

  @Column()
  issuanceDate: Date

  @Column({ nullable: true })
  expirationDate?: Date

  @Column('simple-array')
  context: string[]

  @Column('simple-array')
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
