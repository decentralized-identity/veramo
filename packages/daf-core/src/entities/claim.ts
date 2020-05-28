import { Entity, Column, BaseEntity, ManyToOne, PrimaryColumn } from 'typeorm'
import { Identity } from './identity'
import { Credential } from './credential'

@Entity()
export class Claim extends BaseEntity {
  @PrimaryColumn()
  hash: string

  @ManyToOne(
    type => Identity,
    identity => identity.issuedClaims,
    {
      eager: true,
    },
  )
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
  credential: Credential

  @Column()
  issuanceDate: Date

  @Column({ nullable: true })
  expirationDate?: Date

  @Column('simple-array')
  context: string[]

  @Column('simple-array')
  credentialType: string[]

  @Column()
  type: string

  @Column("text")
  value: string

  @Column()
  isObj: boolean
}
