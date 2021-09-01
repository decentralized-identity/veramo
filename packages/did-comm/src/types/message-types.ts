/**
 * The DIDComm message structure.
 * See https://identity.foundation/didcomm-messaging/spec/#plaintext-message-structure
 *
 * @beta
 */
export interface IDIDCommMessage {
  type: string
  from?: string
  to: string
  thid?: string
  pthid?: string
  id: string
  expires_time?: string
  created_time?: string
  next?: string
  from_prior?: string
  body: any
}

/**
 * Represents different DIDComm v2 message encapsulation
 *
 * @beta
 */
export enum DIDCommMessageMediaType {
  /**
   * A plain JSON DIDComm message
   */
  PLAIN = 'application/didcomm-plain+json',
  
  /**
   * A JWS signed DIDComm message
   */
  SIGNED = 'application/didcomm-signed+json',

  /**
   * A JWE encrypted DIDComm message
   */
  ENCRYPTED = 'application/didcomm-encrypted+json',
}

/**
 * The possible types of message packing.
 *
 * `authcrypt`, `anoncrypt`, `anoncrypt+authcrypt`, and `anoncrypt+jws` will produce `DIDCommMessageMediaType.ENCRYPTED` messages.
 * 
 * `jws` will produce `DIDCommMessageMediaType.SIGNED` messages.
 * 
 * `none` will produce `DIDCommMessageMediaType.PLAIN` messages.
 *
 * 
 * @beta
 */
export type DIDCommMessagePacking =
  | 'authcrypt'
  | 'anoncrypt'
  | 'jws'
  | 'none'
  | 'anoncrypt+authcrypt'
  | 'anoncrypt+jws'

/**
 * Metadata resulting from unpacking a DIDComm v2 message
 *
 * @beta
 */
export interface IDIDCommMessageMetaData {
  packing: DIDCommMessagePacking
  // from_prior, reuse transport etc.
}

/**
 * The result of unpacking a DIDComm v2 message
 *
 * @beta
 */
export interface IUnpackedDIDCommMessage {
  metaData: IDIDCommMessageMetaData
  message: IDIDCommMessage
}

/**
 * The result of packing a DIDComm v2 message.
 * The message is always serialized as string.
 *
 * @beta
 */
export interface IPackedDIDCommMessage {
  message: string
}
