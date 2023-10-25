import { MediationStatus } from '@veramo/core-types'
import { Column, Entity, BaseEntity, PrimaryGeneratedColumn } from 'typeorm'

/**
 * Represents recorded outcome of a mediation request {@link @veramo/did-comm#DIDComm | DIDComm} as GRANTED or DENIED.
 *
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
