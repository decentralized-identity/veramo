/**
 * Provides a {@link @veramo/credential-ld#CredentialIssuerLD | plugin} for the {@link @veramo/core#Agent} that
 * implements
 * {@link @veramo/credential-ld#ICredentialIssuerLD} interface.
 *
 * This plugin adds support for working with JSON-LD credentials.
 * When installed, this plugin will be automatically used by
 * {@link @veramo/credential-w3c#CredentialPlugin | CredentialPlugin} if the user requests the credential to be signed
 * by one of the installed signature suites.
 *
 * @packageDocumentation
 */
export { CredentialIssuerLD } from './action-handler'
export * from './types'
export { LdDefaultContexts } from './ld-default-contexts'
export { VeramoLdSignature } from './ld-suites'
export * from './suites/EcdsaSecp256k1RecoverySignature2020'
export * from './suites/Ed25519Signature2018'
export * from './suites/Ed25519Signature2020'
export * from './suites/JsonWebSignature2020'

/**
 * The parameter and return types schemas for the {@link @veramo/credential-ld#CredentialIssuerLD | CredentialIssuerLD}
 * plugin methods.
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
const schema = require('../plugin.schema.json')
export { schema }
