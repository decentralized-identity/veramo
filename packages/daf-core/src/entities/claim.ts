import {
  Entity,
  Column,
  BaseEntity,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm'
import { Identity } from './identity'
import { Credential } from './credential'

@Entity()
export class Claim extends BaseEntity {
  @PrimaryColumn()
  hash: string

  @ManyToOne(
    type => Identity,
    identity => identity.issuedPresentations, {
      eager: true
    }
  )
  issuer: Identity

  @ManyToOne(
    type => Identity,
    identity => identity.receivedPresentations, {
      eager: true
    }
  )
  subject: Identity

  @ManyToOne(
    type => Credential,
    credential => credential.claims,
  )
  credential: Credential

  @Column()
  type: string

  @Column()
  value: string

  @Column()
  isObj: boolean
}
