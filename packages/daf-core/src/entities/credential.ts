import { blake2bHex } from 'blakejs'
import {
  Entity,
  Column,
  BaseEntity,
  ManyToOne,
  JoinTable,
  PrimaryColumn,
  OneToMany,
  ManyToMany,
  BeforeInsert,
  AfterInsert,
} from 'typeorm'
import { Identity } from './identity'
import { Message } from './message'
import { Presentation } from './presentation'
import { Claim } from './claim'

@Entity()
export class Credential extends BaseEntity {
  @PrimaryColumn()
  hash: string

  @BeforeInsert()
  async updateHash() {
    this.hash = blake2bHex(this.raw)
  }

  setCredentialSubject(credentialSubject: object) {
    this.credentialSubject = credentialSubject
    this.claims = []
    for (const type in this.credentialSubject) {
      if (this.credentialSubject.hasOwnProperty(type)) {
        const value = this.credentialSubject[type]
        const isObj = typeof value === 'function' || (typeof value === 'object' && !!value)
        const claim = new Claim()
        claim.type = type
        claim.value = value
        claim.isObj = isObj
        claim.issuer = this.issuer
        claim.subject = this.subject
        claim.credential = this
        this.claims.push(claim)
      }
    }
  }

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

  @Column('simple-array')
  context: string[]

  @Column('simple-array')
  type: string[]

  @Column('simple-json')
  credentialSubject: object

  @OneToMany(
    type => Claim,
    claim => claim.credential,
    {
      cascade: true,
    },
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
