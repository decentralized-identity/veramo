import { Entity, Column, PrimaryColumn, BaseEntity, OneToMany } from 'typeorm'
import { Key } from './key'

@Entity()
export class Identity extends BaseEntity {
  @PrimaryColumn()
  did: string

  @Column()
  controllerKeyId: string

  @OneToMany(
    type => Key,
    key => key.identity,
  )
  keys: Key[]
}
