import {
  IIdentifier,
  IMessage,
  ManagedKeyInfo,
  VerifiableCredential,
  VerifiablePresentation,
  W3CVerifiableCredential,
  W3CVerifiablePresentation,
} from '@veramo/core'
import { ManagedPrivateKey } from '@veramo/key-manager'

/**
 * This is used internally by {@link @veramo/data-store-json#DataStoreJson | DataStoreJson} to represent a Verifiable
 * Credential in a way that facilitates querying using the {@link @veramo/core#IDataStoreORM} interface.
 *
 * @beta This API may change in future versions without a BREAKING CHANGE notice.
 */
export interface CredentialTableEntry {
  hash: string
  issuer: string
  subject?: string
  id?: string
  issuanceDate?: Date
  expirationDate?: Date
  context: string[]
  type: string[]
  parsedCredential: VerifiableCredential
  canonicalCredential: W3CVerifiableCredential
}

/**
 * This is used internally by {@link @veramo/data-store-json#DataStoreJson | DataStoreJson} to represent the claims
 * contained in a Verifiable Credential in a way that facilitates querying using the {@link @veramo/core#IDataStoreORM}
 * interface.
 *
 * @beta This API may change in future versions without a BREAKING CHANGE notice.
 */
export interface ClaimTableEntry {
  hash: string
  issuer: string
  subject?: string
  credentialHash: string
  issuanceDate?: Date
  expirationDate?: Date
  context: string[]
  credentialType: string[]
  type: string
  value: any
}

/**
 * This is used internally by {@link @veramo/data-store-json#DataStoreJson | DataStoreJson} to represent a Verifiable
 * Presentation in a way that facilitates querying using the {@link @veramo/core#IDataStoreORM} interface.
 *
 * @beta This API may change in future versions without a BREAKING CHANGE notice.
 */
export interface PresentationTableEntry {
  hash: string
  holder: string
  verifier: string[]
  parsedPresentation: VerifiablePresentation
  canonicalPresentation: W3CVerifiablePresentation
  id?: String
  issuanceDate?: Date
  expirationDate?: Date
  context: string[]
  type: string[]
  credentials: VerifiableCredential[]
}

/**
 * A JSON data layout for data-store-json implementations.
 *
 * @beta This API may change in future versions without a BREAKING CHANGE notice.
 */
export interface VeramoJsonCache {
  // usable for AbstractDIDStore implementations
  dids?: Record<string, IIdentifier>
  // usable for AbstractKeyStore implementations
  keys?: Record<string, ManagedKeyInfo>
  // usable for KMS implementations that opt to use the same storage for the private key material
  privateKeys?: Record<string, ManagedPrivateKey>

  // usable for IDataStore and IDataStoreORM implementations
  credentials?: Record<string, CredentialTableEntry>
  claims?: Record<string, ClaimTableEntry>
  presentations?: Record<string, PresentationTableEntry>
  messages?: Record<string, IMessage>
}

/**
 * An extension to {@link VeramoJsonCache} that bundles an update notification callback that allows implementors to
 * persist the {@link VeramoJsonCache} and any other data it may contain to another storage medium.
 *
 * @beta This API may change in future versions without a BREAKING CHANGE notice.
 */
export interface VeramoJsonStore extends VeramoJsonCache {
  notifyUpdate: DiffCallback
}

/**
 * A callback method that is called when the data stored in a {@link VeramoJsonCache} is updated.
 *
 * @param oldState - The snapshot of the cache before the update.
 * @param newState - The new cache object, after the update. This object may reference the underlying storage.
 *
 * @beta This API may change in future versions without a BREAKING CHANGE notice.
 */
export type DiffCallback = (
  oldState: Partial<VeramoJsonCache>,
  newState: Partial<VeramoJsonCache>,
) => Promise<void>
