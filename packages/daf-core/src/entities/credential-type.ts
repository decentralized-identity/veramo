import { Entity, Column, PrimaryGeneratedColumn, BaseEntity } from 'typeorm'

@Entity()
export class CredentialType extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: string

  @Column()
  type: string
}
