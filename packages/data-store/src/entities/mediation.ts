import { MediationStatus } from '@veramo/core-types'
import { Column, Entity, BaseEntity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('mediation')
export class Mediation extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column()
  did!: string

  @Column()
  status!: MediationStatus
}
