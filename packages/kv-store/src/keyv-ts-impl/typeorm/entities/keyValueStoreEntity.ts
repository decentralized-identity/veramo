import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm'


/**
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
@Entity('keyvaluestorevalue')
export class KeyValueStoreEntity extends BaseEntity {
  @PrimaryColumn()
    // @ts-ignore
  key: string

  @Column({
    type: 'text'/*, transformer: {
      // Note: this is a naive implementation which will fail in certain situations. Look into how to properly create a blob type compatible with RN/Browser/Node
      to: (entityValue: Value) => {
        if (entityValue === null || entityValue === undefined) {
          return null
        } else if (typeof entityValue === 'object') {
          return JSON.stringify(entityValue)
        } else {
          return '' + entityValue
        }
      },
      from: (dbValue: string) => {
        if (dbValue === null) {
          return undefined
        } else if (dbValue.trim().startsWith('{') && dbValue.trim().endsWith('}')) {
          return JSON.parse(dbValue) as Value
        } else {
          return dbValue as Value
        }
      },
    },*/
  })
    // @ts-ignore
  value: string

  expires?: number
}
