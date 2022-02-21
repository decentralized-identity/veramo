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
export interface VeramoJsonStore {
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

export class MemoryJsonStore implements VeramoJsonStore {
  claims: Record<string, ClaimTableEntry>
  credentials: Record<string, CredentialTableEntry>
  dids: Record<string, IIdentifier>
  keys: Record<string, ManagedKeyInfo>
  messages: Record<string, IMessage>
  presentations: Record<string, PresentationTableEntry>
  privateKeys: Record<string, ManagedPrivateKey>

  callback: DiffCallback

  constructor() {
    this.dids = {}
    this.keys = {}
    this.credentials = {}
    this.presentations = {}
    this.messages = {}
    this.claims = {}
    this.privateKeys = {}
    this.callback = () => Promise.resolve()
  }
}

export type DiffCallback = (
  oldState: Partial<VeramoJsonStore>,
  newState: Partial<VeramoJsonStore>,
) => Promise<void>
