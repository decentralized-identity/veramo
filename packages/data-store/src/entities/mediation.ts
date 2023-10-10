import { Column, Entity, BaseEntity, PrimaryColumn } from 'typeorm'

enum MediationStatus {
  GRANTED = 'GRANTED',
  DENIED = 'DENIED',
}

@Entity('mediation')
export class Mediation extends BaseEntity {
  @PrimaryColumn()
  did!: string

  @Column({ nullable: false })
  status!: MediationStatus
}
