import { blake2bHex } from 'blakejs'
import { Entity, Column, BaseEntity, ManyToOne, PrimaryColumn, OneToMany, ManyToMany } from 'typeorm'
import { Identity } from './identity'
import { Message } from './message'
import { Presentation } from './presentation'
import { Claim } from './claim'

@Entity()
export class Credential extends BaseEntity {
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

  private _credentialSubject: object

  @Column('simple-json')
  get credentialSubject(): object {
    return this._credentialSubject
  }

  set credentialSubject(credentialSubject: object) {
    this._credentialSubject = credentialSubject
    this.claims = []
    for (const type in this.credentialSubject) {
      if (this.credentialSubject.hasOwnProperty(type)) {
        const value = this.credentialSubject[type]
        const isObj = typeof value === 'function' || (typeof value === 'object' && !!value)
        const claim = new Claim()
        claim.hash = blake2bHex(this.raw + type)
        claim.type = type
        claim.value = isObj ? JSON.stringify(value) : value
        claim.isObj = isObj
        claim.issuer = this.issuer
        claim.subject = this.subject
        claim.expirationDate = this.expirationDate
        claim.issuanceDate = this.issuanceDate
        claim.credentialType = this.type
        claim.context = this.context
        this.claims.push(claim)
      }
    }
  }

  @ManyToOne(
    type => Identity,
    identity => identity.issuedCredentials,
    {
      cascade: ['insert'],
      eager: true,
    },
  )
  issuer: Identity

  // Subject can be null https://w3c.github.io/vc-data-model/#credential-uniquely-identifies-a-subject
  @ManyToOne(
    type => Identity,
    identity => identity.receivedCredentials,
    {
      cascade: ['insert'],
      eager: true,
      nullable: true,
    },
  )
  subject?: Identity

  @Column({ nullable: true })
  id?: string

  @Column()
  issuanceDate: Date

  @Column({ nullable: true })
  expirationDate?: Date

  @Column('simple-array')
  context: string[]

  @Column('simple-array')
  type: string[]

  @OneToMany(
    type => Claim,
    claim => claim.credential,
    {
      cascade: ['insert'],
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
    message => message.credentials,
  )
  messages: Message[]
}
