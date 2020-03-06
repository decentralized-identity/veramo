import {
  Entity,
  Column,
  BaseEntity,
  ManyToOne,
  JoinTable,
  PrimaryColumn,
  OneToMany,
  ManyToMany,
} from 'typeorm'
import { Identity } from './identity'
import { Message } from './message'
import { Credential } from './credential'

@Entity()
export class Presentation extends BaseEntity {
  @PrimaryColumn()
  hash: string

  @ManyToOne(
    type => Identity,
    identity => identity.issuedPresentations,
  )
  issuer: Identity

  @ManyToOne(
    type => Identity,
    identity => identity.receivedPresentations,
  )
  audience: Identity

  @Column()
  issuedAt: number

  @Column()
  notBefore: number

  @Column()
  expiresAt: number

  @Column()
  raw: string

  context: string[]

  type: string[]

  @ManyToMany(
    type => Credential,
    credential => credential.presentations,
  )
  @JoinTable()
  credentials: Credential[]

  @ManyToMany(
    type => Message,
    message => message.presentations,
  )
  messages: Message[]
}
