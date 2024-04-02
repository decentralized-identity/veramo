import { JwkDidSupportedKeyTypes, KeyUse, SupportedKeyTypes } from './types/utility-types.js'
import type { VerificationMethod, JsonWebKey } from 'did-resolver'
import { secp256k1 } from '@noble/curves/secp256k1'
import { p256 } from '@noble/curves/p256'
import { bytesToBase64url, hexToBytes } from 'did-jwt'
import { extractPublicKeyHex } from './did-utils.js'

export function getKeyUse(keyType: JwkDidSupportedKeyTypes, passedKeyUse?: KeyUse): KeyUse {
  if (passedKeyUse) {
    if (passedKeyUse !== 'sig' && passedKeyUse !== 'enc') {
      throw new Error('illegal_argument: Key use must be sig or enc')
    }
    if (passedKeyUse === 'sig' && keyType === 'X25519') {
      throw new Error('illegal_argument: X25519 keys cannot be used for signing')
    }
    if (passedKeyUse === 'enc' && keyType === 'Ed25519') {
      throw new Error('illegal_argument: Ed25519 keys cannot be used for encryption')
    }
    return passedKeyUse
  }
  switch (keyType) {
    case 'Secp256k1':
    case 'Secp256r1':
    case 'Ed25519':
      return 'sig'
    case 'X25519':
      return 'enc'
    default:
      throw new Error('illegal_argument: Unknown key type')
  }
}

export function isJWK(data: unknown): data is JsonWebKey {
  if (
    typeof data === 'object' &&
    data &&
    'crv' in data &&
    typeof data.crv === 'string' &&
    'kty' in data &&
    'x' in data &&
    typeof data.x === 'string' &&
    ((data.kty === 'EC' && 'y' in data && typeof data.y === 'string') ||
      (data.kty === 'OKP' && !('y' in data)))
  ) {
    return true
  }
  return false
}

export function createJWK(
  keyType: JwkDidSupportedKeyTypes,
  pubKey: string | Uint8Array,
  passedKeyUse?: KeyUse,
): JsonWebKey | undefined {
  try {
    const keyUse = getKeyUse(keyType, passedKeyUse)
    switch (keyType) {
      case SupportedKeyTypes.Secp256k1: {
        const point = secp256k1.ProjectivePoint.fromHex(pubKey).toAffine()

        return {
          alg: 'ES256K',
          crv: 'secp256k1',
          kty: 'EC',
          ...(keyUse && { use: keyUse }),
          // FIXME: test endianness of the toString(16) output
          x: bytesToBase64url(hexToBytes(point.x.toString(16))),
          y: bytesToBase64url(hexToBytes(point.y.toString(16))),
        } as JsonWebKey
      }
      case SupportedKeyTypes.Secp256r1: {
        const point = p256.ProjectivePoint.fromHex(pubKey).toAffine()

        return {
          alg: 'ES256',
          crv: 'P-256',
          kty: 'EC',
          ...(keyUse && { use: keyUse }),
          x: bytesToBase64url(hexToBytes(point.x.toString(16))),
          y: bytesToBase64url(hexToBytes(point.y.toString(16))),
        } as JsonWebKey
      }
      case SupportedKeyTypes.Ed25519:
        return {
          alg: 'EdDSA',
          crv: 'Ed25519',
          kty: 'OKP',
          ...(keyUse && { use: keyUse }),
          x: bytesToBase64url(typeof pubKey === 'string' ? hexToBytes(pubKey) : pubKey),
        } as JsonWebKey
      case SupportedKeyTypes.X25519:
        return {
          alg: 'ECDH-ES',
          crv: 'X25519',
          kty: 'OKP',
          ...(keyUse && { use: keyUse }),
          x: bytesToBase64url(typeof pubKey === 'string' ? hexToBytes(pubKey) : pubKey),
        } as JsonWebKey
      default:
        throw new Error(`not_supported: Failed to create JWK using ${keyType}`)
    }
  } catch (error) {
    throw error
  }
}

export function generateJwkFromVerificationMethod(
  keyType: JwkDidSupportedKeyTypes,
  key: VerificationMethod,
  keyUse?: KeyUse,
) {
  const { publicKeyHex, keyType: extractedType } = extractPublicKeyHex(key)
  return createJWK(keyType, publicKeyHex, keyUse)
}
