import { Entity, Column, BaseEntity, ManyToOne, PrimaryColumn } from 'typeorm'
import { Identity } from './identity'
import { Credential } from './credential'

@Entity()
export class Claim extends BaseEntity {
  @PrimaryColumn()
  //@ts-ignore
  hash: string

  @ManyToOne(
    type => Identity,
    identity => identity.issuedClaims,
    {
      eager: true,
    },
  )
  //@ts-ignore
  issuer: Identity

  @ManyToOne(
    type => Identity,
    identity => identity.receivedClaims,
    {
      eager: true,
      nullable: true,
    },
  )
  subject?: Identity

  @ManyToOne(
    type => Credential,
    credential => credential.claims,
  )
  //@ts-ignore
  credential: Credential

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
  credentialType: string[]

  @Column()
  //@ts-ignore
  type: string

  @Column('text')
  //@ts-ignore
  value: string

  @Column()
  //@ts-ignore
  isObj: boolean
}
