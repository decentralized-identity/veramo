import { IKey, KeyMetadata } from '@veramo/core-types'
import { VerificationMethod } from 'did-resolver'

/**
 * Broader definition of Verification method that includes the legacy publicKeyBase64
 * @internal
 */
export type _ExtendedVerificationMethod = VerificationMethod & { publicKeyBase64?: string }

/**
 * Represents an {@link @veramo/core-types#IKey} that has been augmented with its corresponding
 * entry from a DID document.
 * `key.meta.verificationMethod` will contain the {@link did-resolver#VerificationMethod}
 * object from the {@link did-resolver#DIDDocument}
 * @internal
 */
export interface _ExtendedIKey extends IKey {
  meta: KeyMetadata & {
    verificationMethod: _NormalizedVerificationMethod
  }
}

/**
 * Represents a {@link did-resolver#VerificationMethod} whose public key material
 * has been converted to `publicKeyHex`
 *
 * @internal
 */
export type _NormalizedVerificationMethod = Omit<
  VerificationMethod,
  'publicKeyBase58' | 'publicKeyBase64' | 'publicKeyJwk' | 'publicKeyMultibase'
>

/**
 * Accept a Type or a Promise of that Type.
 *
 * @internal
 */
export type OrPromise<T> = T | Promise<T>

/**
 * A mapping of string to another type.
 * Both Map and Record are accepted.
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export type RecordLike<T> = Map<string, T> | Record<string, T>

export enum SupportedKeyTypes {
  Secp256r1 = 'Secp256r1',
  Secp256k1 = 'Secp256k1',
  Ed25519 = 'Ed25519',
  X25519 = 'X25519',
}

export type KeyUse = 'sig' | 'enc'

export type JwkDidSupportedKeyTypes = keyof typeof SupportedKeyTypes
