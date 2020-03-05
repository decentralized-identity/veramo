import { Entity, Column, PrimaryColumn, BaseEntity, OneToMany } from 'typeorm'
import { Key } from './key'
import { Action } from './action'
import { Message } from './message'
import { Presentation } from './presentation'
import { Credential } from './credential'
import { Claim } from './claim'

@Entity()
export class Identity extends BaseEntity {
  @PrimaryColumn()
  did: string

  @Column()
  controllerKeyId: string

  @OneToMany(
    type => Key,
    key => key.identity,
  )
  keys: Key[]

  @OneToMany(
    type => Action,
    action => action.identity,
  )
  actions: Action[]

  @OneToMany(
    type => Message,
    message => message.sender,
  )
  sentMessages: Message[]

  @OneToMany(
    type => Message,
    message => message.receiver,
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
