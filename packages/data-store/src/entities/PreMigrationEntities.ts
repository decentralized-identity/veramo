import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm'
import { KeyType } from "./key";

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
