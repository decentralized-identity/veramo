import { CreateDatabase1447159020001 } from './1.createDatabase.js'
import { SimplifyRelations1447159020002 } from './2.simplifyRelations.js'
import { CreatePrivateKeyStorage1629293428674 } from './3.createPrivateKeyStorage.js'
import { AllowNullIssuanceDateForPresentations1637237492913 } from './4.allowNullVPIssuanceDate.js'

/**
 * The migrations array that SHOULD be used when initializing a TypeORM database connection.
 *
 * These ensure the correct creation of tables and the proper migrations of data when tables change between versions.
 *
 * @public
 */
export const migrations = [
  CreateDatabase1447159020001,
  SimplifyRelations1447159020002,
  CreatePrivateKeyStorage1629293428674,
  AllowNullIssuanceDateForPresentations1637237492913,
]
