import { Verifiable, W3CCredential, W3CPresentation } from 'did-jwt-vc'
export { W3CCredential, W3CPresentation }
/**
 * Verifiable Credential {@link https://github.com/decentralized-identity/did-jwt-vc}
 * @public
 */
export type VerifiableCredential = Verifiable<W3CCredential>

/**
 * Verifiable Presentation {@link https://github.com/decentralized-identity/did-jwt-vc}
 * @public
 */
export type VerifiablePresentation = Verifiable<W3CPresentation>



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
 * DIDComm message
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
  data?: string | object

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
  metaData?: IMetaData[]

  /**
   * Optional. Array of attached verifiable credentials
   */
  credentials?: VerifiableCredential[]

  /**
   * Optional. Array of attached verifiable presentations
   */
  presentations?: VerifiablePresentation[]
}