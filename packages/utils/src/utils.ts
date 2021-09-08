import { convertPublicKeyToX25519, convertSecretKeyToX25519 } from '@stablelib/ed25519'
import { computePublicKey } from '@ethersproject/signing-key'
import { DIDDocumentSection, IAgentContext, IIdentifier, IKey, IResolver } from '@veramo/core'
import { VerificationMethod, DIDDocument } from 'did-resolver'
import * as u8a from 'uint8arrays'

import Debug from 'debug'
import {
  _ExtendedIKey,
  _ExtendedVerificationMethod,
  _NormalizedVerificationMethod,
} from './types/utility-types'
const debug = Debug('veramo:utils')

export function bytesToBase64url(b: Uint8Array): string {
  return u8a.toString(b, 'base64url')
}

export function base64ToBytes(s: string): Uint8Array {
  const inputBase64Url = s.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
  return u8a.fromString(inputBase64Url, 'base64url')
}

export function bytesToBase64(b: Uint8Array): string {
  return u8a.toString(b, 'base64pad')
}

export function encodeBase64url(s: string): string {
  return bytesToBase64url(u8a.fromString(s))
}

export function decodeBase64url(s: string): string {
  return u8a.toString(base64ToBytes(s))
}

export function encodeJoseBlob(payload: {}) {
  return u8a.toString(u8a.fromString(JSON.stringify(payload), 'utf-8'), 'base64url')
}

export function decodeJoseBlob(blob: string) {
  return JSON.parse(u8a.toString(u8a.fromString(blob, 'base64url'), 'utf-8'))
}

export function isDefined<T>(arg: T): arg is Exclude<T, null | undefined> {
  return arg !== null && typeof arg !== 'undefined' 
}

export function convertIdentifierEncryptionKeys(identifier: IIdentifier): IKey[] {
  return identifier.keys
    .map((key) => {
      if (key.type === 'Ed25519') {
        const publicBytes = u8a.fromString(key.publicKeyHex, 'base16')
        key.publicKeyHex = u8a.toString(convertPublicKeyToX25519(publicBytes), 'base16')
        if (key.privateKeyHex) {
          const privateBytes = u8a.fromString(key.privateKeyHex)
          key.privateKeyHex = u8a.toString(convertSecretKeyToX25519(privateBytes), 'base16')
        }
        key.type = 'X25519'
      } else if (key.type !== 'X25519') {
        debug(`key of type ${key.type} is not supported for [de]encryption`)
        return null
      }
      return key
    })
    .filter(isDefined)
}

export function compressIdentifierSecp256k1Keys(identifier: IIdentifier): IKey[] {
  return identifier.keys
    .map((key) => {
      if (key.type === 'Secp256k1') {
        const publicBytes = u8a.fromString(key.publicKeyHex, 'base16')
        const compressedKey = computePublicKey(publicBytes, true).substring(2)
        key.publicKeyHex = compressedKey
      }
      return key
    })
    .filter(isDefined)
}

export async function mapIdentifierKeysToDoc(
  identifier: IIdentifier,
  section: DIDDocumentSection = 'keyAgreement',
  context: IAgentContext<IResolver>,
): Promise<_ExtendedIKey[]> {
  const didDocument = await resolveDidOrThrow(identifier.did, context)

  // dereference all key agreement keys from DID document and normalize
  const keyAgreementKeys: _NormalizedVerificationMethod[] = await dereferenceDidKeys(
    didDocument,
    section,
    context,
  )

  let localKeys = identifier.keys.filter(isDefined)
  if (section === 'keyAgreement') {
    localKeys = convertIdentifierEncryptionKeys(identifier)
  } else {
    localKeys = compressIdentifierSecp256k1Keys(identifier)
  }
  // finally map the didDocument keys to the identifier keys by comparing `publicKeyHex`
  const extendedKeys: _ExtendedIKey[] = keyAgreementKeys
    .map((verificationMethod) => {
      const localKey = localKeys.find((localKey) => localKey.publicKeyHex === verificationMethod.publicKeyHex)
      if (localKey) {
        const { meta, ...localProps } = localKey
        return { ...localProps, meta: { ...meta, verificationMethod } }
      } else {
        return null
      }
    })
    .filter(isDefined)

  return extendedKeys
}

export async function resolveDidOrThrow(
  didUrl: string,
  context: IAgentContext<IResolver>,
): Promise<DIDDocument> {
  // TODO: add caching
  const docResult = await context.agent.resolveDid({ didUrl: didUrl })
  const err = docResult?.didResolutionMetadata?.error
  const msg = docResult?.didResolutionMetadata?.message
  const didDocument = docResult.didDocument
  if (!isDefined(didDocument) || err) {
    throw new Error(`not_found: could not resolve DID document for '${didUrl}': ${err} ${msg}`)
  }
  return didDocument
}

/**
 * Dereferences keys from DID document and normalizes them for easy comparison.
 *
 * When dereferencing keyAgreement keys, only Ed25519 and X25519 curves are supported.
 * Other key types are omitted from the result and Ed25519 keys are converted to X25519
 *
 * @returns Promise<NormalizedVerificationMethod[]>
 */
export async function dereferenceDidKeys(
  didDocument: DIDDocument,
  section: DIDDocumentSection = 'keyAgreement',
  context: IAgentContext<IResolver>,
): Promise<_NormalizedVerificationMethod[]> {
  const convert = section === 'keyAgreement'
  if (section === 'service') {
    return []
  }
  return (
    await Promise.all(
      (didDocument[section] || []).map(async (key: string | VerificationMethod) => {
        if (typeof key === 'string') {
          try {
            return (await context.agent.getDIDComponentById({
              didDocument,
              didUrl: key,
              section,
            })) as _ExtendedVerificationMethod
          } catch (e) {
            return null
          }
        } else {
          return key as _ExtendedVerificationMethod
        }
      }),
    )
  )
    .filter(isDefined)
    .map((key) => {
      const hexKey = extractPublicKeyHex(key, convert)
      const { publicKeyHex, publicKeyBase58, publicKeyBase64, publicKeyJwk, ...keyProps } = key
      const newKey = { ...keyProps, publicKeyHex: hexKey }
      if (convert && 'Ed25519VerificationKey2018' === newKey.type) {
        newKey.type = 'X25519KeyAgreementKey2019'
      }
      return newKey
    })
    .filter((key) => key.publicKeyHex.length > 0)
}

/**
 * Converts the publicKey of a VerificationMethod to hex encoding (publicKeyHex)
 *
 * @param pk the VerificationMethod to be converted
 * @param convert when this flag is set to true, Ed25519 keys are converted to their X25519 pairs
 * @returns
 */
export function extractPublicKeyHex(pk: _ExtendedVerificationMethod, convert: boolean = false): string {
  let keyBytes: Uint8Array
  if (pk.publicKeyHex) {
    keyBytes = u8a.fromString(pk.publicKeyHex, 'base16')
  } else if (pk.publicKeyBase58) {
    keyBytes = u8a.fromString(pk.publicKeyBase58, 'base58btc')
  } else if (pk.publicKeyBase64) {
    keyBytes = u8a.fromString(pk.publicKeyBase64, 'base64pad')
  } else return ''
  if (convert) {
    if (['Ed25519', 'Ed25519VerificationKey2018'].includes(pk.type)) {
      keyBytes = convertPublicKeyToX25519(keyBytes)
    } else if (!['X25519', 'X25519KeyAgreementKey2019'].includes(pk.type)) {
      return ''
    }
  }
  return u8a.toString(keyBytes, 'base16')
}
