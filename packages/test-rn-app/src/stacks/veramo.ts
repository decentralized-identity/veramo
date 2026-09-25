// @veramo/credential-ld through its public entry point, with ONE suite:
// Ed25519Signature2020, the first suite in ticket 10c's order.
import { VeramoEd25519Signature2020 } from '@veramo/credential-ld'
import { ED25519_IMPORT, type LdSuiteCase } from '../ld.tests.ts'

export const veramoEd25519Signature2020 = (): LdSuiteCase => ({
  name: 'Ed25519Signature2020',
  suite: new VeramoEd25519Signature2020(),
  identifier: ED25519_IMPORT,
})
