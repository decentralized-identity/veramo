import { asArray, isDefined } from './type-utils.js'
import {
  CredentialPayload,
  IMessage,
  IssuerType,
  PresentationPayload,
  VerifiableCredential,
  VerifiablePresentation,
  W3CVerifiableCredential,
  W3CVerifiablePresentation,
} from '@veramo/core-types'
import pkg from 'blakejs'
const { blake2bHex } = pkg
import { decodeJWT } from 'did-jwt'
import { normalizeCredential, normalizePresentation } from 'did-jwt-vc'

/**
 * Every Verifiable Credential `@context` property must contain this.
 *
 * @public
 */
export const MANDATORY_CREDENTIAL_CONTEXT = 'https://www.w3.org/2018/credentials/v1'

/**
 * Processes an entry or an array of entries into an array of entries. If a `startWithEntry` param is provided, it is
 * set as the first item in the result array.
 * @param inputEntryOrArray - The input that needs to be transformed to an array.
 * @param startWithEntry - If this is provided, this element will be the first in the resulting array.
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export function processEntryToArray(
  inputEntryOrArray?: string | string[] | any,
  startWithEntry?: string,
): string[] {
  const result: string[] = asArray<string>(inputEntryOrArray) || [startWithEntry]
  if (startWithEntry && result[0] !== startWithEntry) {
    result.unshift(startWithEntry)
  }
  return result.filter<string>(isDefined).filter((item, index, arr) => arr.indexOf(item) === index)
}

/**
 * Parses a {@link @veramo/core-types#W3CVerifiableCredential | W3CVerifiableCredential} and converts it to a
 * {@link @veramo/core-types#VerifiableCredential | VerifiableCredential} so it is easier to use programmatically.
 *
 * @param input - the raw credential to be transformed
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export function decodeCredentialToObject(input: W3CVerifiableCredential): VerifiableCredential {
  return typeof input === 'string' ? normalizeCredential(input) : <VerifiableCredential>input
}

/**
 * Parses a {@link @veramo/core-types#W3CVerifiablePresentation | W3CVerifiablePresentation} and converts it to a
 * {@link @veramo/core-types#VerifiablePresentation | VerifiablePresentation} so it is easier to use programmatically.
 *
 * @param input - the raw presentation to be transformed.
 *
 * @beta This API may change without a BREAKING CHANGE notice.
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
 * @param input - the Credential or Presentation whose hash is neeeded
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export function computeEntryHash(
  input: W3CVerifiableCredential | W3CVerifiablePresentation | IMessage,
): string {
  let hashable: string
  if (typeof input === 'string') {
    try {
      const cred = JSON.parse(input)
      hashable = cred?.proof?.jwt || input
    } catch (e) {
      hashable = input
    }
  } else if ((<VerifiableCredential>input)?.proof?.jwt) {
    hashable = (<VerifiableCredential>input).proof.jwt
  } else {
    hashable = JSON.stringify(input)
  }
  return blake2bHex(hashable)
}

/**
 * Decodes a credential or presentation and returns the issuer ID
 * `iss` from a JWT or `issuer`/`issuer.id` from a VC or `holder` from a VP
 *
 * @param input - the credential or presentation whose issuer/holder needs to be extracted.
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export function extractIssuer(
  input?:
    | W3CVerifiableCredential
    | W3CVerifiablePresentation
    | CredentialPayload
    | PresentationPayload
    | null,
): string {
  if (!isDefined(input)) {
    return ''
  } else if (typeof input === 'string') {
    // JWT
    try {
      const { payload } = decodeJWT(input)
      return payload.iss || ''
    } catch (e: any) {
      return ''
    }
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
