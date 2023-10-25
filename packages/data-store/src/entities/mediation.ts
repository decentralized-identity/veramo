import { MediationStatus } from '@veramo/core-types'
import { Column, Entity, BaseEntity, PrimaryGeneratedColumn } from 'typeorm'

/**
 * @beta This API may change without a BREAKING CHANGE notice.
 */
@Entity('mediation')
export class Mediation extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column()
  did!: string

  @Column()
  status!: MediationStatus
}
