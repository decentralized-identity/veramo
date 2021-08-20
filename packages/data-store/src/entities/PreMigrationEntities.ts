import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm'

@Entity('key')
export class PreMigrationKey extends BaseEntity {
  @PrimaryColumn()
  //@ts-ignore
  kid: string

  @Column()
  //@ts-ignore
  type: KeyType

  @Column({ nullable: true })
  privateKeyHex?: string
}
