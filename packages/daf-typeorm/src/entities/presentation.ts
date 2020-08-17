import { VerifiablePresentation } from 'daf-core'
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
  //@ts-ignore
  hash: string

  //@ts-ignore
  private _raw: IVerifiablePresentation

  set raw(raw: VerifiablePresentation) {
    this._raw = raw
    this.hash = blake2bHex(JSON.stringify(raw))
  }

  @Column({ type: 'simple-json' })
  get raw(): VerifiablePresentation {
    return this._raw
  }

  @ManyToOne((type) => Identity, (identity) => identity.issuedPresentations, {
    cascade: ['insert'],
    eager: true,
  })
  //@ts-ignore
  holder: Identity

  @ManyToMany((type) => Identity, (identity) => identity.receivedPresentations, {
    cascade: ['insert'],
    eager: true,
    nullable: true,
  })
  @JoinTable()
  //@ts-ignore
  verifier?: Identity[]

  @Column({ nullable: true })
  id?: String

  @Column()
  //@ts-ignore
  issuanceDate: Date

  @Column({ nullable: true })
  expirationDate?: Date

  @Column('simple-array')
  //@ts-ignore
  context: string[]

  @Column('simple-array')
  //@ts-ignore
  type: string[]

  @ManyToMany((type) => Credential, (credential) => credential.presentations, {
    cascade: true,
  })
  @JoinTable()
  //@ts-ignore
  credentials: Credential[]

  @ManyToMany((type) => Message, (message) => message.presentations)
  //@ts-ignore
  messages: Message[]
}

export const createPresentationEntity = (vp: VerifiablePresentation): Presentation => {
  const presentation = new Presentation()
  presentation.context = vp['@context']
  presentation.type = vp.type
  presentation.id = vp.id

  if (vp.issuanceDate) {
    presentation.issuanceDate = new Date(vp.issuanceDate)
  }

  if (vp.expirationDate) {
    presentation.expirationDate = new Date(vp.expirationDate)
  }

  const holder = new Identity()
  holder.did = vp.holder
  presentation.holder = holder

  presentation.verifier = vp.verifier?.map((verifierDid) => {
    const id = new Identity()
    id.did = verifierDid
    return id
  })

  presentation.raw = vp

  presentation.credentials = vp.verifiableCredential.map(createCredentialEntity)
  return presentation
}
