/**
 * Provides {@link @veramo/core#Agent} implementation and defines {@link @veramo/core-types#IResolver},
 * {@link @veramo/core-types#IDIDManager}, {@link @veramo/core-types#IKeyManager}, {@link
 * @veramo/core-types#IDataStore}, {@link @veramo/core-types#IMessageHandler} plugin interfaces
 *
 * @packageDocumentation
 */
export { CoreEvents } from './coreEvents'
export * from './agent'
export * from './types/IAgent'
export * from './types/ICredentialPlugin'
export * from './types/ICredentialIssuer'
export * from './types/ICredentialVerifier'
export * from './types/ICredentialStatus'
export * from './types/ICredentialStatusManager'
export * from './types/ICredentialStatusVerifier'
export * from './types/IDataStore'
export * from './types/IDataStoreORM'
export * from './types/IIdentifier'
export * from './types/IDIDManager'
export * from './types/IKeyManager'
export * from './types/IMessage'
export * from './types/IMessageHandler'
export * from './types/IResolver'
export * from './types/IError'
export * from './types/IVerifyResult'
export * from './types/vc-data-model'
