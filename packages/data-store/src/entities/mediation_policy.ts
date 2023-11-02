import { Column, Entity, BaseEntity, PrimaryGeneratedColumn } from 'typeorm'

/**
 * Represents a MediationPolicy associated with a given did {@link @veramo/did-comm#DIDComm | DIDComm}
 * as either ALLOW or DENY
 *
 * Consumed by the {@link @veramo/did-comm#CoordinateMediationMediatiorMessageHandler | CoordinateMediationMediatiorMessageHandler}
 * when making a determination as to whether to ALLOW or DENY a mediation request.
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
@Entity('mediation_policy')
export class MediationPolicy extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ unique: true })
  did!: string

  @Column()
  policy!: any
}
