import { Entity, BaseEntity, Column, PrimaryGeneratedColumn } from 'typeorm'

/**
 * Represents a Recipient Did provided by a recipient to the mediator {@link @veramo/did-comm#DIDComm | DIDComm}
 * for the purpose of informing the mediator of the dids in use by the recipient.
 *
 * Consumed by the {@link @veramo/did-comm#CoordinateMediationMediatiorMessageHandler | CoordinateMediationMediatiorMessageHandler}
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
@Entity('recipient_did')
export class RecipientDid extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column()
  did!: string

  @Column()
  recipient_did!: string
}
