import { Entity, Column, PrimaryColumn, BaseEntity, ManyToOne } from 'typeorm'
import { Identity } from './identity'

@Entity()
export class Service extends BaseEntity {
  @PrimaryColumn()
  //@ts-ignore
  id: string

  @Column()
  //@ts-ignore
  type: string

  @Column()
  //@ts-ignore
  serviceEndpoint: string

  @Column({ nullable: true })
  description?: string

  @ManyToOne((type) => Identity, (identity) => identity.services)
  //@ts-ignore
  identity: Identity
}
