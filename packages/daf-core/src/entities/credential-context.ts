import { Entity, Column, PrimaryGeneratedColumn, BaseEntity } from 'typeorm'

@Entity()
export class CredentialContext extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: string

  @Column()
  context: string
}
