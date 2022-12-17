/**
 * The DIDComm message structure.
 * See https://identity.foundation/didcomm-messaging/spec/#plaintext-message-structure
 *
 * @beta This API may change without a BREAKING CHANGE notice.
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
  attachments?: IDIDCommMessageAttachment[]
}

/**
 * Extra options when packing a DIDComm message.
 *
 * @beta - This API may change without a BREAKING CHANGE notice.
 */
export interface IDIDCommOptions {
  /**
   * Add extra recipients for the packed message.
   */
  bcc?: string[]
}

/**
 * Represents different DIDComm v2 message encapsulation.
 *
 * @beta This API may change without a BREAKING CHANGE notice.
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
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export type DIDCommMessagePacking =
  | 'authcrypt'
  | 'anoncrypt'
  | 'jws'
  | 'none'
  | 'anoncrypt+authcrypt'
  | 'anoncrypt+jws'

/**
 * Metadata resulting from unpacking a DIDComm v2 message.
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export interface IDIDCommMessageMetaData {
  packing: DIDCommMessagePacking
  // from_prior, reuse transport etc.
}

/**
 * The result of unpacking a DIDComm v2 message.
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export interface IUnpackedDIDCommMessage {
  metaData: IDIDCommMessageMetaData
  message: IDIDCommMessage
}

/**
 * The result of packing a DIDComm v2 message.
 * The message is always serialized as string.
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export interface IPackedDIDCommMessage {
  message: string
}

/**
 * The DIDComm message structure for attachments.
 * See https://identity.foundation/didcomm-messaging/spec/#attachments
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export interface IDIDCommMessageAttachment {
  id?: string
  description?: string
  filename?: string
  media_type?: string
  format?: string
  lastmod_time?: string
  byte_count?: number
  data: IDIDCommMessageAttachmentData
}

/**
 * The DIDComm message structure for data in an attachment.
 * See https://identity.foundation/didcomm-messaging/spec/#attachments
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export interface IDIDCommMessageAttachmentData {
  jws?: any
  hash?: string
  links?: string[]
  base64?: string
  json?: any
}
