/**
 * Represents a signed Verifiable Credential payload (includes proof).
 * See {@link https://www.w3.org/TR/vc-data-model/#credentials | VC data model}
 * 
 * @public
 */
export interface VerifiableCredential extends W3CCredential {
  proof: {
    type?: string
    [x: string]: any
  }
}

/**
 * Represents a signed Verifiable Presentation (includes proof).
 * See {@link https://www.w3.org/TR/vc-data-model/#presentations | VP data model}
 * @public
 */
export interface VerifiablePresentation extends W3CPresentation {
  proof: {
    type?: string
    [x: string]: any
  }
}

/**
 * Represents an unsigned W3C Credential payload.
 * See {@link https://www.w3.org/TR/vc-data-model/#credentials | VC data model}
 * @public
 */
export interface W3CCredential {
  '@context': string[]
  id?: string
  type: string[]
  issuer: { id: string; [x: string]: any }
  issuanceDate: string
  expirationDate?: string
  credentialSubject: {
    id?: string
    [x: string]: any
  }
  credentialStatus?: {
    id: string
    type: string
  }
  [x: string]: any
}

/**
 * Represents an unsigned W3C Presentation payload.
 * See {@link https://www.w3.org/TR/vc-data-model/#presentations | VP data model}
 * @public
 */
export interface W3CPresentation {
  id?: string
  holder: string
  issuanceDate?: string
  expirationDate?: string
  '@context': string[]
  type: string[]
  verifier: string[]
  verifiableCredential?: VerifiableCredential[]
  [x: string]: any
}

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
}
