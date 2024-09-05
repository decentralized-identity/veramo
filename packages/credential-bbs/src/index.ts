/**
 * Provides a {@link @veramo/credential-bbs#CredentialProviderLD | handler} for the {@link @veramo/credential-w3c#CredentialPlugin} that
 * implements
 * {@link @veramo/core-types#AbstractCredentialProvider} interface.
 *
 * This plugin adds support for working with BBS credentials.
 * When installed, this plugin will be automatically used by
 * {@link @veramo/credential-w3c#CredentialPlugin | CredentialPlugin} if the user requests the credential to be signed
 * by one of the installed signature suites.
 *
 * @packageDocumentation
 */
export { CredentialProviderBBS } from './CredentialProviderBBS.js'
export { BbsDefaultContexts } from './bbs-default-contexts.js'
export { VeramoBbsSignature } from './bbs-suites.js'
export * from './types.js'
