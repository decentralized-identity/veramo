import { IKey, KeyMetadata } from "@veramo/core"
import { JWE } from "did-jwt"
import { VerificationMethod } from "did-resolver"
import { DIDCommMessageMediaType, IDIDCommMessage } from "./message-types"

export type DIDCommPlainMessage = IDIDCommMessage & { typ: DIDCommMessageMediaType.PLAIN }

export type DIDCommEncryptedMessage = JWE

export type FlattenedJWS = {
  payload: string
  protected?: string
  header?: Record<string, any>
  signature: string
}

export type GenericJWS = {
  payload: string
  signatures: [{ protected?: string; header?: Record<string, any>; signature: string }]
}

export type DIDCommSignedMessage = FlattenedJWS | GenericJWS

export type ExtendedVerificationMethod = VerificationMethod & { publicKeyBase64?: string }

/**
 * represents an IKey that has been augmented with its corresponding entry from a DID document
 *
 * this is only used internally
 */
export interface ExtendedIKey extends IKey {
  meta: KeyMetadata & {
    verificationMethod: NormalizedVerificationMethod
  }
}

/**
 * represents a VerificationMethod whose public key material has been converted to publicKeyHex
 */
export type NormalizedVerificationMethod = Omit<
  VerificationMethod,
  'publicKeyBase58' | 'publicKeyBase64' | 'publicKeyJwk'
>
