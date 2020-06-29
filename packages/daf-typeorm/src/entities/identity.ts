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
import { Service } from './service'
import { Message } from './message'
import { Presentation } from './presentation'
import { Credential } from './credential'
import { Claim } from './claim'
import { Connection } from 'typeorm'

@Entity()
export class Identity extends BaseEntity {
  @PrimaryColumn()
  //@ts-ignore
  did: string

  @Column({ nullable: true })
  //@ts-ignore
  provider: string

  @Column({ nullable: true })
  //@ts-ignore
  alias: string

  @CreateDateColumn()
  //@ts-ignore
  saveDate: Date

  @UpdateDateColumn()
  //@ts-ignore
  updateDate: Date

  @Column({ nullable: true })
  //@ts-ignore
  controllerKeyId: string

  @OneToMany(
    type => Key,
    key => key.identity,
  )
  //@ts-ignore
  keys: Key[]

  @OneToMany(
    type => Service,
    service => service.identity,
  )
  //@ts-ignore
  services: Service[]

  @OneToMany(
    type => Message,
    message => message.from,
  )
  //@ts-ignore
  sentMessages: Message[]

  @OneToMany(
    type => Message,
    message => message.to,
  )
  //@ts-ignore
  receivedMessages: Message[]

  @OneToMany(
    type => Presentation,
    presentation => presentation.holder,
  )
  //@ts-ignore
  issuedPresentations: Presentation[]

  @ManyToMany(
    type => Presentation,
    presentation => presentation.verifier,
  )
  //@ts-ignore
  receivedPresentations: Presentation[]

  @OneToMany(
    type => Credential,
    credential => credential.issuer,
  )
  //@ts-ignore
  issuedCredentials: Credential[]

  @OneToMany(
    type => Credential,
    credential => credential.subject,
  )
  //@ts-ignore
  receivedCredentials: Credential[]

  @OneToMany(
    type => Claim,
    claim => claim.issuer,
  )
  //@ts-ignore
  issuedClaims: Claim[]

  @OneToMany(
    type => Claim,
    claim => claim.subject,
  )
  //@ts-ignore
  receivedClaims: Claim[]

  /**
   * Convenience method
   *
   * const name = await identity.getLatestClaimValue({type: 'name'})
   *
   * @param where
   */
  async getLatestClaimValue(
    dbConnection: Promise<Connection>,
    where: { type: string },
  ): Promise<string | undefined> {
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
