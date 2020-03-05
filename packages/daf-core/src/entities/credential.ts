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
import { Presentation } from './presentation'
import { CredentialContext } from './credential-context'
import { CredentialType } from './credential-type'
import { Claim } from './claim'

@Entity()
export class Credential extends BaseEntity {
  @PrimaryColumn()
  hash: string

  @ManyToOne(
    type => Identity,
    identity => identity.issuedCredentials,
  )
  issuer: Identity

  @ManyToOne(
    type => Identity,
    identity => identity.receivedCredentials,
  )
  subject: Identity

  @Column()
  issuedAt: number

  @Column()
  notBefore: number

  @Column()
  expiresAt: number

  @Column()
  raw: string

  @ManyToMany(type => CredentialContext)
  @JoinTable()
  context: CredentialContext[]

  @ManyToMany(type => CredentialType)
  @JoinTable()
  type: CredentialType[]

  @OneToMany(
    type => Claim,
    claim => claim.credential,
  )
  claims: Claim[]

  @ManyToMany(
    type => Presentation,
    presentation => presentation.credentials,
  )
  presentations: Presentation[]

  @ManyToMany(
    type => Message,
    message => message.presentations,
  )
  messages: Message[]
}
