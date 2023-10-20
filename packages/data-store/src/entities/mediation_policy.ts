import { MediationPolicies } from '@veramo/core-types'
import { Column, Entity, BaseEntity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('mediation_policy')
export class MediationPolicy extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column()
  did!: string

  @Column()
  policy!: MediationPolicies
}
