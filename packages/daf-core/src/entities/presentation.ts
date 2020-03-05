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
import { PresentationContext } from './presentation-context'
import { PresentationType } from './presentation-type'
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

  @ManyToMany(type => PresentationContext)
  @JoinTable()
  context: PresentationContext[]

  @ManyToMany(type => PresentationType)
  @JoinTable()
  type: PresentationType[]

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
