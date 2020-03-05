import { Entity, Column, PrimaryGeneratedColumn, BaseEntity } from 'typeorm'

@Entity()
export class PresentationContext extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: string

  @Column()
  context: string
}
