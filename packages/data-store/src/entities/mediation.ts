import { Column, Entity, BaseEntity, PrimaryColumn } from 'typeorm'

@Entity('mediation')
export class Mediation extends BaseEntity {
  @PrimaryColumn()
  did!: string

  @Column({ nullable: false })
  status!: 'GRANTED' | 'DENIED'
}
