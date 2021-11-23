import { CreateDatabase1447159020001 } from './1.createDatabase'
import { SimplifyRelations1447159020002 } from './2.simplifyRelations'
import { CreatePrivateKeyStorage1629293428674 } from './3.createPrivateKeyStorage'
import { AllowNullIssuanceDateForPresentations1637237492913 } from './4.allowNullVPIssuanceDate'

export const migrations = [
  CreateDatabase1447159020001,
  SimplifyRelations1447159020002,
  CreatePrivateKeyStorage1629293428674,
  AllowNullIssuanceDateForPresentations1637237492913,
]
