import { Entity, Column, BaseEntity, ManyToOne, PrimaryColumn, Relation } from 'typeorm'
import { Identifier } from './identifier.js'
import { Credential } from './credential.js'

/**
 * Represents the properties of a claim extracted from a Verifiable Credential `credentialSubject`, and stored in a
 * TypeORM database for querying.
 *
 * @see {@link @veramo/core-types#IDataStoreORM} for the interface defining how this can be queried.
 * @see {@link @veramo/data-store#DataStoreORM} for the implementation of the query interface.
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
@Entity('claim')
export class Claim extends BaseEntity {
  @PrimaryColumn()
  // @ts-ignore
  hash: string

  @ManyToOne((type) => Identifier, (identifier) => identifier.issuedClaims, {
    eager: true,
    onDelete: 'CASCADE',
  })
  // @ts-ignore
  issuer: Relation<Identifier>

  @ManyToOne((type) => Identifier, (identifier) => identifier.receivedClaims, {
    eager: true,
    nullable: true,
  })
  subject?: Relation<Identifier>

  @ManyToOne((type) => Credential, (credential) => credential.claims, {
    onDelete: 'CASCADE',
  })
  // @ts-ignore
  credential: Relation<Credential>

  @Column()
  // @ts-ignore
  issuanceDate: Date

  @Column({ nullable: true })
  expirationDate?: Date

  @Column('simple-array')
  // @ts-ignore
  context: string[]

  @Column('simple-array')
  // @ts-ignore
  credentialType: string[]

  @Column()
  // @ts-ignore
  type: string

  @Column('text', { nullable: true })
  // @ts-ignore
  value: string | null

  @Column()
  // @ts-ignore
  isObj: boolean
}
