import { Entity, Column, PrimaryColumn, BaseEntity, OneToMany, ManyToMany } from 'typeorm'
import { Key } from './key'
import { Message } from './message'
import { Presentation } from './presentation'
import { Credential } from './credential'
import { Claim } from './claim'

@Entity()
export class Identity extends BaseEntity {
  @PrimaryColumn()
  did: string

  @Column({ nullable: true })
  provider: string

  @Column({ nullable: true })
  controllerKeyId: string

  @OneToMany(
    type => Key,
    key => key.identity,
  )
  keys: Key[]

  @OneToMany(
    type => Message,
    message => message.from,
  )
  sentMessages: Message[]

  @OneToMany(
    type => Message,
    message => message.to,
  )
  receivedMessages: Message[]

  @OneToMany(
    type => Presentation,
    presentation => presentation.issuer,
  )
  issuedPresentations: Presentation[]

  @OneToMany(
    type => Presentation,
    presentation => presentation.audience,
  )
  receivedPresentations: Presentation[]

  @OneToMany(
    type => Credential,
    credential => credential.issuer,
  )
  issuedCredentials: Credential[]

  @OneToMany(
    type => Credential,
    credential => credential.subject,
  )
  receivedCredentials: Credential[]

  @OneToMany(
    type => Claim,
    claim => claim.issuer,
  )
  issuedClaims: Claim[]

  @OneToMany(
    type => Claim,
    claim => claim.subject,
  )
  receivedClaims: Claim[]
}
