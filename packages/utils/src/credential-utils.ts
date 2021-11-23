import { asArray, isDefined } from './type-utils'
import {
  CredentialPayload,
  IMessage,
  IssuerType,
  PresentationPayload,
  VerifiableCredential,
  VerifiablePresentation,
  W3CVerifiableCredential,
  W3CVerifiablePresentation,
} from '@veramo/core'
import { blake2bHex } from 'blakejs'
import { decodeJWT } from 'did-jwt'
import { normalizeCredential, normalizePresentation } from 'did-jwt-vc'

export const MANDATORY_CREDENTIAL_CONTEXT = 'https://www.w3.org/2018/credentials/v1'

/**
 * Processes an entry or an array of entries into an array of entries. If a `startWithEntry` param is provided, it is
 * set as the first item in the result array.
 * @param inputEntryOrArray
 * @param startWithEntry
 *
 * @beta This API may change without prior notice.
 */
export function processEntryToArray(
  inputEntryOrArray?: string | string[] | null,
  startWithEntry?: string,
): string[] {
  const result: string[] = asArray<string>(inputEntryOrArray) || [startWithEntry]
  if (startWithEntry && result[0] !== startWithEntry) {
    result.unshift(startWithEntry)
  }
  return result.filter<string>(isDefined).filter((item, index, arr) => arr.indexOf(item) === index)
}

/**
 * Parses a {@link W3CVerifiableCredential} and converts it to a {@link VerifiableCredential} so it is easier to use
 * programmatically.
 *
 * @param input

 * @beta This API may change without prior notice.
 */
export function decodeCredentialToObject(input: W3CVerifiableCredential): VerifiableCredential {
  return typeof input === 'string' ? normalizeCredential(input) : <VerifiableCredential>input
}

/**
 * Parses a {@link W3CVerifiableCredential} and converts it to a {@link VerifiablePresentation} so it is easier to use
 * programmatically.
 *
 * @param input

 * @beta This API may change without prior notice.
 */
export function decodePresentationToObject(input: W3CVerifiablePresentation): VerifiablePresentation {
  let result: VerifiablePresentation
  if (typeof input === 'string') {
    result = normalizePresentation(input)
  } else {
    result = input as VerifiablePresentation
    result.verifiableCredential = asArray<W3CVerifiableCredential>(result.verifiableCredential).map(
      decodeCredentialToObject,
    )
  }
  return result
}

/**
 * Computes a hash for a given credential or presentation.
 * This hash is usable as an internal ID for database indexing
 *
 * @param input
 *
 * @beta This API may change without prior notice.
 */
export function computeEntryHash(
  input: W3CVerifiableCredential | W3CVerifiablePresentation | IMessage,
): string {
  if (typeof input === 'string') {
    // TODO: try to parse as JSON before assuming it's a JWT?
    return blake2bHex(input)
  } else if ((<VerifiableCredential>input)?.proof?.jwt) {
    return blake2bHex((<VerifiableCredential>input).proof.jwt)
  } else {
    return blake2bHex(JSON.stringify(input))
  }
}

/**
 * Decodes a credential or presentation and returns the issuer ID
 * `iss` from a JWT or `issuer`/`issuer.id` from a VC or `holder` from a VP
 *
 * @param input
 *
 * @beta This API may change without prior notice.
 */
export function extractIssuer(
  input: W3CVerifiableCredential | W3CVerifiablePresentation | CredentialPayload | PresentationPayload,
): string {
  if (typeof input === 'string') {
    // JWT
    const { payload } = decodeJWT(input)
    return payload.iss || ''
  } else {
    // JSON
    let iss: IssuerType
    if (input.issuer) {
      iss = input.issuer
    } else if (input.holder) {
      iss = input.holder
    } else {
      iss = ''
    }
    return typeof iss === 'string' ? iss : iss?.id || ''
  }
}
