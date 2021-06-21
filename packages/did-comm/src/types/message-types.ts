
/**
 * The DIDComm message structure.
 * See https://identity.foundation/didcomm-messaging/spec/#plaintext-message-structure
 */
 export interface IDIDCommMessage {
  type: string
  from?: string
  to: string
  thread_id?: string
  id: string
  expires_time?: string
  created_time?: string
  next?: string
  from_prior?: string
  body: any
}

export enum DIDCommMessageMediaType {
  PLAIN = 'application/didcomm-plain+json',
  SIGNED = 'application/didcomm-signed+json',
  ENCRYPTED = 'application/didcomm-encrypted+json',
}

export type DIDCommMessagePacking =
  | 'authcrypt'
  | 'anoncrypt'
  | 'jws'
  | 'none'
  | 'anoncrypt+authcrypt'
  | 'anoncrypt+jws'

export interface IDIDCommMessageMetaData {
  packing: DIDCommMessagePacking
  // from_prior, reuse transport etc.
}

export interface IUnpackedDIDCommMessage {
  metaData: IDIDCommMessageMetaData
  message: IDIDCommMessage
}

export interface IPackedDIDCommMessage {
  message: string
}
