import { Entity, Column, PrimaryGeneratedColumn, BaseEntity } from 'typeorm'

@Entity()
export class PresentationType extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: string

  @Column()
  type: string
}
