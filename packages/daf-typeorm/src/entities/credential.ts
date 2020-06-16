import { IVerifiableCredential } from 'daf-core'
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

  private _raw: IVerifiableCredential

  set raw(raw: IVerifiableCredential) {
    this._raw = raw
    this.hash = blake2bHex(JSON.stringify(raw))
  }

  @Column('simple-json')
  get raw(): IVerifiableCredential {
    return this._raw
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

export const createCredentialEntity = (vc: IVerifiableCredential): Credential => {
  const credential = new Credential()
  credential.context = vc['@context']
  credential.type = vc.type
  credential.id = vc.id

  if (vc.issuanceDate) {
    credential.issuanceDate = new Date(vc.issuanceDate)
  }

  if (vc.expirationDate) {
    credential.expirationDate = new Date(vc.expirationDate)
  }

  const issuer = new Identity()
  issuer.did = vc.issuer
  credential.issuer = issuer

  credential.claims = []
  for (const type in vc.credentialSubject) {
    if (vc.credentialSubject.hasOwnProperty(type)) {
      const value = vc.credentialSubject[type]

      if (type === 'id') {
        const subject = new Identity()
        subject.did = value
        credential.subject = subject
      } else {
        const isObj = typeof value === 'function' || (typeof value === 'object' && !!value)
        const claim = new Claim()
        claim.hash = blake2bHex(JSON.stringify(vc.raw) + type)
        claim.type = type
        claim.value = isObj ? JSON.stringify(value) : value
        claim.isObj = isObj
        claim.issuer = credential.issuer
        claim.subject = credential.subject
        claim.expirationDate = credential.expirationDate
        claim.issuanceDate = credential.issuanceDate
        claim.credentialType = credential.type
        claim.context = credential.context
        credential.claims.push(claim)
      }
    }
  }

  credential.raw = vc
  return credential
}
