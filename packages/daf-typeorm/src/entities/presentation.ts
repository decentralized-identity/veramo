import { IVerifiablePresentation } from 'daf-core'
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
import { Credential, createCredentialEntity } from './credential'

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

export const createPresentationEntity = (vp: IVerifiablePresentation): Presentation => {
  const presentation = new Presentation()
  presentation.context = vp["@context"]
  presentation.type = vp.type
  presentation.id = vp.id

  if (vp.issuanceDate) {  
    presentation.issuanceDate = new Date(vp.issuanceDate)
  }

  if (vp.expirationDate) {  
    presentation.expirationDate = new Date(vp.expirationDate)
  }
  
  const issuer = new Identity()
  issuer.did = vp.issuer
  presentation.issuer = issuer

  presentation.audience = vp.audience.map(audienceDid => {
    const id = new Identity()
    id.did = audienceDid
    return id
  })

  presentation.raw = vp.proof?.jwt

  presentation.credentials = vp.verifiableCredential.map(createCredentialEntity)
  return presentation
}


export const createPresentation = (args: Presentation): IVerifiablePresentation => {
  const presentation: Partial<IVerifiablePresentation> = {
    type: args.type,
    '@context': args.context,
    proof: {
      jwt: args.raw
    }
}
  // TODO standardize this transformation

  return presentation as IVerifiablePresentation

}