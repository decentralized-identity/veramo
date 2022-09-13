/**
 * Provides a {@link @veramo/credential-ld#CredentialIssuerLD | plugin} for the {@link @veramo/core#Agent} that
 * implements
 * {@link @veramo/credential-ld#ICredentialIssuerLD} interface.
 *
 * This plugin adds support for working with JSON-LD credentials.
 * When installed, this plugin will be automatically used by
 * {@link @veramo/credential-w3c#CredentialIssuer | CredentialIssuer} if the user requests the credential to be signed
 * by one of the installed signature suites.
 *
 * @packageDocumentation
 */
export { CredentialIssuerLD } from './action-handler.js'
export * from './types.js'
export { LdDefaultContexts } from './ld-default-contexts.js'
export { VeramoLdSignature } from './ld-suites.js'
export * from './suites/EcdsaSecp256k1RecoverySignature2020.js'
export * from './suites/Ed25519Signature2018.js'

/**
 * The parameter and return types schemas for the {@link @veramo/credential-ld#CredentialIssuerLD | CredentialIssuerLD}
 * plugin methods.
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
