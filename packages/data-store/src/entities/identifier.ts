import {
  Entity,
  Column,
  Connection,
  PrimaryColumn,
  BaseEntity,
  OneToMany,
  ManyToMany,
  Index,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm'
import { Key } from './key.js'
import { Service } from './service.js'
import { Message } from './message.js'
import { Presentation } from './presentation.js'
import { Credential } from './credential.js'
import { Claim } from './claim.js'

/**
 * Represents some properties and relationships of an {@link @veramo/core-types#IIdentifier} that are stored in a TypeORM
 * database for the purpose of keeping track of keys and services associated with a DID managed by a Veramo agent.
 *
 * @see {@link @veramo/data-store#DIDStore | DIDStore} for the implementation used by the
 *   {@link @veramo/did-manager#DIDManager | DIDManager}.
 * @see {@link @veramo/data-store#DataStoreORM | DataStoreORM} for the implementation of the query interface.
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
@Entity('identifier')
@Index(['alias', 'provider'], { unique: true })
export class Identifier extends BaseEntity {
  @PrimaryColumn()
  // @ts-ignore
  did: string

  @Column({ nullable: true })
  // @ts-ignore
  provider?: string

  @Column({ nullable: true })
  // @ts-ignore
  alias?: string

  @BeforeInsert()
  setSaveDate() {
    this.saveDate = new Date()
    this.updateDate = new Date()
  }

  @BeforeUpdate()
  setUpdateDate() {
    this.updateDate = new Date()
  }

  @Column({ select: false })
  // @ts-ignore
  saveDate: Date

  @Column({ select: false })
  // @ts-ignore
  updateDate: Date

  @Column({ nullable: true })
  // @ts-ignore
  controllerKeyId?: string

  @OneToMany((type) => Key, (key) => key.identifier)
  // @ts-ignore
  keys: Key[]

  @OneToMany((type) => Service, (service) => service.identifier, {
    cascade: true,
  })
  // @ts-ignore
  services: Service[]

  @OneToMany((type) => Message, (message) => message.from)
  // @ts-ignore
  sentMessages: Message[]

  @OneToMany((type) => Message, (message) => message.to)
  // @ts-ignore
  receivedMessages: Message[]

  @OneToMany((type) => Presentation, (presentation) => presentation.holder)
  // @ts-ignore
  issuedPresentations: Presentation[]

  @ManyToMany((type) => Presentation, (presentation) => presentation.verifier)
  // @ts-ignore
  receivedPresentations: Presentation[]

  @OneToMany((type) => Credential, (credential) => credential.issuer)
  // @ts-ignore
  issuedCredentials: Credential[]

  @OneToMany((type) => Credential, (credential) => credential.subject)
  // @ts-ignore
  receivedCredentials: Credential[]

  @OneToMany((type) => Claim, (claim) => claim.issuer)
  // @ts-ignore
  issuedClaims: Claim[]

  @OneToMany((type) => Claim, (claim) => claim.subject)
  // @ts-ignore
  receivedClaims: Claim[]

  /**
   * Convenience method to get the most recent information about a subject DID as described by Verifiable Credential
   * claims.
   *
   * Example:
   * ```typescript
   * // get the latest claim value for credentials containing `credentialSubject.name` and this Identifier as subject.
   * const name = await identifier.getLatestClaimValue({type: 'name'})
   * ```
   *
   * @param where - The TypeORM `where` filter to use.
   */
  async getLatestClaimValue(
    dbConnection: Promise<Connection>,
    where: any,
  ): Promise<string | null | undefined> {
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
