import { Entity, Column, PrimaryColumn, BaseEntity, ManyToOne } from 'typeorm'
import { Identity } from './identity'

export type KeyType = 'Ed25519' | 'Secp256k1'

@Entity()
export class Key extends BaseEntity {
  @PrimaryColumn()
  //@ts-ignore
  kid: string

  @Column()
  //@ts-ignore
  kms: string

  @Column()
  //@ts-ignore
  type: KeyType

  @Column()
  //@ts-ignore
  publicKeyHex: string

  @Column()
  privateKeyHex?: string

  @Column({ type: 'simple-json', nullable: true })
  meta?: Record<string, any>

  @ManyToOne((type) => Identity, (identity) => identity.keys)
  //@ts-ignore
  identity: Identity
}
