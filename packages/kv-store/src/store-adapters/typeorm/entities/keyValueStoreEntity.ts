import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm'

/**
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
@Entity('keyvaluestore')
export class KeyValueStoreEntity extends BaseEntity {
  @PrimaryColumn()
  // @ts-ignore
  key: string

  @Column({
    type: 'text',
  })
  // @ts-ignore
  data: string

  expires?: number
}
