import { IIdentifier, IKey, IMessage, VerifiableCredential, VerifiablePresentation } from '@veramo/core'

export interface DefaultRecords {
  dids: Record<string, IIdentifier>
  keys: Record<string, IKey>
  credentials: Record<string, VerifiableCredential>
  presentations: Record<string, VerifiablePresentation>
  messages: Record<string, IMessage>
  // privateKeys: Record<string, IKey>
}

export class DefaultRecords implements DefaultRecords {
  constructor() {
    this.dids = {}
    this.keys = {}
    this.credentials = {}
    this.presentations = {}
    this.messages = {}
  }
}

export type DiffCallback = (
  oldState: Partial<DefaultRecords>,
  newState: Partial<DefaultRecords>,
) => Promise<void>
