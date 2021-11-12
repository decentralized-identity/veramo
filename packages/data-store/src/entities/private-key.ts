import { TKeyType } from '@veramo/core'
import { Entity, Column, PrimaryColumn, BaseEntity } from 'typeorm'

export type KeyType = TKeyType

@Entity('private-key')
export class PrivateKey extends BaseEntity {
  @PrimaryColumn()
  //@ts-ignore
  alias: string

  @Column()
  //@ts-ignore
  type: KeyType

  @Column()
  //@ts-ignore
  privateKeyHex: string
}
