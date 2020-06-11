import {
  Entity,
  Column,
  PrimaryColumn,
  BaseEntity,
  OneToMany,
  ManyToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm'
import { Key } from './key'
import { Message } from './message'
import { Presentation } from './presentation'
import { Credential } from './credential'
import { Claim } from './claim'
import { Connection } from 'typeorm'

@Entity()
export class Identity extends BaseEntity {
  @PrimaryColumn()
  did: string

  @Column({ nullable: true })
  provider: string

  @CreateDateColumn()
  saveDate: Date

  @UpdateDateColumn()
  updateDate: Date

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

  @ManyToMany(
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

  /**
   * Convenience method
   *
   * const name = await identity.getLatestClaimValue({type: 'name'})
   *
   * @param where
   */
  async getLatestClaimValue(dbConnection: Promise<Connection>, where: { type: string }): Promise<String> {
    const claim = await (await dbConnection).getRepository(Claim).findOne({
      where: {
        ...where,
        subject: this.did,
      },
      order: {
        issuanceDate: 'DESC',
      },
    })
    return claim?.value
  }

  shortDid() {
    return `${this.did.slice(0, 15)}...${this.did.slice(-4)}`
  }
}
