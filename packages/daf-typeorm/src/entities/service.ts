import { Entity, Column, PrimaryColumn, BaseEntity, ManyToOne } from 'typeorm'
import { Identity } from './identity'

@Entity()
export class Service extends BaseEntity {
  @PrimaryColumn()
  id: string

  @Column()
  type: string

  @Column()
  serviceEndpoint: string

  @Column({ nullable: true })
  description?: string

  @ManyToOne(
    type => Identity,
    identity => identity.services,
  )
  identity: Identity
}
