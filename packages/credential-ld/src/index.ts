/**
 * Provides a {@link @veramo/credential-ld#CredentialIssuerLD | plugin} for the {@link @veramo/core#Agent} that implements
 * {@link @veramo/credential-ld#ICredentialIssuerLD} interface.
 *
 * @packageDocumentation
 */
export {
  CredentialIssuerLD,
  ICredentialIssuerLD,
  ICreateVerifiableCredentialArgs,
  ICreateVerifiablePresentationArgs,
  ProofFormat,
} from './action-handler'
export { LdCredentialModule } from './ld-credential-module'
export { LdContextLoader } from './ld-context-loader'
export { LdDefaultContexts } from './ld-default-contexts'
export { LdSuiteLoader } from './ld-suite-loader'
export {
  VeramoLdSignature,
} from './ld-suites'
export * from './suites/EcdsaSecp256k1RecoverySignature2020'
export * from './suites/Ed25519Signature2018'
const schema = require('../plugin.schema.json')
export { schema }
