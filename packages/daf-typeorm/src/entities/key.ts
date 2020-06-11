import { Entity, Column, PrimaryColumn, BaseEntity, ManyToOne } from 'typeorm'
import { Identity } from './identity'

export type KeyType = 'Ed25519' | 'Secp256k1'

@Entity()
export class Key extends BaseEntity {
  @PrimaryColumn()
  kid: string

  @Column()
  type: KeyType

  @Column()
  publicKeyHex: string

  @Column()
  privateKeyHex?: string

  @ManyToOne(
    type => Identity,
    identity => identity.keys,
  )
  identity: Identity
}
