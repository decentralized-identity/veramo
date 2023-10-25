import { MediationPolicies } from '@veramo/core-types'
import { Column, Entity, BaseEntity, PrimaryGeneratedColumn } from 'typeorm'

/**
 * @beta This API may change without a BREAKING CHANGE notice.
 */
@Entity('mediation_policy')
export class MediationPolicy extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ unique: true })
  did!: string

  @Column()
  policy!: MediationPolicies
}
