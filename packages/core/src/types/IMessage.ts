import { VerifiableCredential, VerifiablePresentation } from './vc-data-model.js'

/**
 * Message meta data
 * @public
 */
export interface IMetaData {
  /**
   * Type
   */
  type: string

  /**
   * Optional. Value
   */
  value?: string
}

/**
 * Message attachment
 * @public
 */
export interface IMessageAttachment {
  id?: string
  description?: string
  filename?: string
  media_type?: string
  format?: string
  lastmod_time?: string
  byte_count?: number
  data: IMessageAttachmentData
}

/**
 * The DIDComm message structure for data in an attachment.
 * See https://identity.foundation/didcomm-messaging/spec/#attachments
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export interface IMessageAttachmentData {
  jws?: any
  hash?: string
  links?: string[]
  base64?: string
  json?: any
}

/**
 * Represents a DIDComm v1 message payload, with optionally decoded credentials and presentations.
 * @public
 */
export interface IMessage {
  /**
   * Unique message ID
   */
  id: string

  /**
   * Message type
   */
  type: string

  /**
   * Optional. Creation date (ISO 8601)
   */
  createdAt?: string

  /**
   * Optional. Expiration date (ISO 8601)
   */
  expiresAt?: string

  /**
   * Optional. Thread ID
   */
  threadId?: string

  /**
   * Optional. Original message raw data
   */
  raw?: string

  /**
   * Optional. Parsed data
   */
  data?: object | null

  /**
   * Optional. List of DIDs to reply to
   */
  replyTo?: string[]

  /**
   * Optional. URL to post a reply message to
   */
  replyUrl?: string

  /**
   * Optional. Sender DID
   */
  from?: string

  /**
   * Optional. Recipient DID
   */
  to?: string

  /**
   * Optional. Array of message metadata
   */
  metaData?: IMetaData[] | null

  /**
   * Optional. Array of attached verifiable credentials
   */
  credentials?: VerifiableCredential[]

  /**
   * Optional. Array of attached verifiable presentations
   */
  presentations?: VerifiablePresentation[]

  /**
   * Optional. Array of generic attachments
   */
  attachments?: IMessageAttachment[]

  /**
   * Optional. Signal how to reuse transport for return messages
   */
  returnRoute?: string
}
