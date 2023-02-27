import { Entity, Column, PrimaryColumn, BaseEntity, ManyToOne, Relation } from 'typeorm'
import { Identifier } from './identifier.js'

/**
 * Represents some properties of a {@link did-resolver#ServiceEndpoint | ServiceEndpoint} as it is stored in a TypeORM
 * database. This is used by {@link @veramo/data-store#DIDStore | DIDStore} to provide information to
 * {@link @veramo/did-manager#DIDManager | DIDManager} when DID management information is stored in a local TypeORM
 * database.
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
@Entity('service')
export class Service extends BaseEntity {
  @PrimaryColumn()
    // @ts-ignore
  id: string

  @Column()
    // @ts-ignore
  type: string

  @Column()
    // @ts-ignore
  serviceEndpoint: string

  @Column({ nullable: true })
  description?: string

  @ManyToOne((type) => Identifier, (identifier) => identifier?.services, { onDelete: 'CASCADE' })
    // @ts-ignore
  identifier?: Relation<Identifier>
}
