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

export class VeramoJsonCache implements VeramoJsonCache {
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

  constructor(initialState?: VeramoJsonCache) {
    this.dids = { ...initialState?.dids }
    this.keys = { ...initialState?.keys }
    this.privateKeys = { ...initialState?.privateKeys }
    this.credentials = { ...initialState?.credentials }
    this.claims = { ...initialState?.claims }
    this.presentations = { ...initialState?.presentations }
    this.messages = { ...initialState?.messages }
  }
}

export type DiffCallback = (
  oldState: Partial<VeramoJsonCache>,
  newState: Partial<VeramoJsonCache>,
) => Promise<void>
