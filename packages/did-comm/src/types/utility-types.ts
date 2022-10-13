import { JWE } from 'did-jwt'
import { DIDCommMessageMediaType, IDIDCommMessage } from './message-types.js'

/**
 * Represents a plaintext DIDComm v2 message object.
 * @internal
 */
export type _DIDCommPlainMessage = IDIDCommMessage & { typ: DIDCommMessageMediaType.PLAIN }

/**
 * Represents an encrypted DIDComm v2 message object
 * @internal
 */
export type _DIDCommEncryptedMessage = JWE

/**
 * Type definition of a JSON serialized JWS in flattened form (only one signer)
 * @internal
 */
export type _FlattenedJWS = {
  payload: string
  protected?: string
  header?: Record<string, any>
  signature: string
}

/**
 * Type definition of a JSON serialized JWS in generic form
 * @internal
 */
export type _GenericJWS = {
  payload: string
  signatures: [{ protected?: string; header?: Record<string, any>; signature: string }]
}

/**
 * Composite type representing the 2 accepted forms of JWS DIDComm v2 message
 * @internal
 */
export type _DIDCommSignedMessage = _FlattenedJWS | _GenericJWS
