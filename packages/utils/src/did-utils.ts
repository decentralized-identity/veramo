import { convertPublicKeyToX25519, convertSecretKeyToX25519 } from '@stablelib/ed25519'
import { computePublicKey } from '@ethersproject/signing-key'
import { computeAddress } from '@ethersproject/transactions'
import { DIDDocumentSection, IAgentContext, IIdentifier, IKey, IResolver } from '@veramo/core-types'
import { DIDDocument, VerificationMethod } from 'did-resolver'
import {
  _ExtendedIKey,
  _ExtendedVerificationMethod,
  _NormalizedVerificationMethod,
} from './types/utility-types.js'
import { isDefined } from './type-utils.js'
import * as u8a from 'uint8arrays'
import elliptic from 'elliptic'
import { bases } from 'multiformats/basics'
import Debug from 'debug'
import { hexToBytes, bytesToHex, base64ToBytes, base58ToBytes } from './encodings.js'

const debug = Debug('veramo:utils')

/**
 * Converts any Ed25519 keys of an {@link @veramo/core-types#IIdentifier | IIdentifier} to X25519 to be usable for encryption.
 *
 * @param identifier - the identifier with keys
 *
 * @returns the array of converted keys filtered to contain only those usable for encryption.
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
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

/**
 * Converts any Secp256k1 public keys of an {@link @veramo/core-types#IIdentifier | IIdentifier} to their compressed form.
 *
 * @param identifier - the identifier with keys
 *
 * @returns the array of keys where the Secp256k1 entries are compressed.
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export function compressIdentifierSecp256k1Keys(identifier: IIdentifier): IKey[] {
  return identifier.keys
    .map((key) => {
      if (key.type === 'Secp256k1') {
        if (key.publicKeyHex) {
          const publicBytes = u8a.fromString(key.publicKeyHex, 'base16')
          key.publicKeyHex = computePublicKey(publicBytes, true).substring(2)
          key.meta = { ...key.meta }
          key.meta.ethereumAddress = computeAddress('0x' + key.publicKeyHex)
        }
      }
      return key
    })
    .filter(isDefined)
}

/**
 * Compares the `blockchainAccountId` of a `EcdsaSecp256k1RecoveryMethod2020` verification method with the address
 * computed from a locally managed key.
 *
 * @returns true if the local key address corresponds to the `blockchainAccountId`
 *
 * @param localKey - The locally managed key
 * @param verificationMethod - a {@link did-resolver#VerificationMethod | VerificationMethod} with a
 *   `blockchainAccountId`
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
function compareBlockchainAccountId(localKey: IKey, verificationMethod: VerificationMethod): boolean {
  if (
    (verificationMethod.type !== 'EcdsaSecp256k1RecoveryMethod2020' &&
      verificationMethod.type !== 'EcdsaSecp256k1RecoveryMethod2019') ||
    localKey.type !== 'Secp256k1'
  ) {
    return false
  }
  let vmEthAddr = getEthereumAddress(verificationMethod)
  if (localKey.meta?.account) {
    return vmEthAddr === localKey.meta?.account.toLowerCase()
  }
  const computedAddr = computeAddress('0x' + localKey.publicKeyHex).toLowerCase()
  return computedAddr === vmEthAddr
}

/**
 * Extracts an ethereum address from a {@link did-resolver#VerificationMethod | verification method} supporting legacy
 * representations.
 *
 * @param verificationMethod - the VerificationMethod object (from a DID document)
 *
 * @returns an ethereum address `string` or `undefined` if none could be extracted
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export function getEthereumAddress(verificationMethod: VerificationMethod): string | undefined {
  let vmEthAddr = verificationMethod.ethereumAddress?.toLowerCase()
  if (!vmEthAddr) {
    if (verificationMethod.blockchainAccountId?.includes('@eip155')) {
      vmEthAddr = verificationMethod.blockchainAccountId?.split('@eip155')[0].toLowerCase()
    } else if (verificationMethod.blockchainAccountId?.startsWith('eip155')) {
      vmEthAddr = verificationMethod.blockchainAccountId.split(':')[2]?.toLowerCase()
    } else if (
      verificationMethod.publicKeyHex ||
      verificationMethod.publicKeyBase58 ||
      verificationMethod.publicKeyBase64 ||
      verificationMethod.publicKeyJwk
    ) {
      const pbBytes = extractPublicKeyBytes(verificationMethod)
      const pbHex = computePublicKey(pbBytes, false)

      vmEthAddr = computeAddress(pbHex).toLowerCase()
    }
  }
  return vmEthAddr
}
interface LegacyVerificationMethod extends VerificationMethod {
  publicKeyBase64: string
}

function extractPublicKeyBytes(pk: VerificationMethod): Uint8Array {
  if (pk.publicKeyBase58) {
    return base58ToBytes(pk.publicKeyBase58)
  } else if (pk.publicKeyMultibase) {
    return bases['base58btc'].decode(pk.publicKeyMultibase)
  } else if ((<LegacyVerificationMethod>pk).publicKeyBase64) {
    return base64ToBytes((<LegacyVerificationMethod>pk).publicKeyBase64)
  } else if (pk.publicKeyHex) {
    return hexToBytes(pk.publicKeyHex)
  } else if (
    pk.publicKeyJwk &&
    pk.publicKeyJwk.crv === 'secp256k1' &&
    pk.publicKeyJwk.x &&
    pk.publicKeyJwk.y
  ) {
    const secp256k1 = new elliptic.ec('secp256k1')
    return hexToBytes(
      secp256k1
        .keyFromPublic({
          x: bytesToHex(base64ToBytes(pk.publicKeyJwk.x)),
          y: bytesToHex(base64ToBytes(pk.publicKeyJwk.y)),
        })
        .getPublic('hex'),
    )
  } else if (
    pk.publicKeyJwk &&
    (pk.publicKeyJwk.crv === 'Ed25519' || pk.publicKeyJwk.crv === 'X25519') &&
    pk.publicKeyJwk.x
  ) {
    return base64ToBytes(pk.publicKeyJwk.x)
  }
  return new Uint8Array()
}

/**
 * Extracts the chain ID from a {@link did-resolver#VerificationMethod | verification method} supporting legacy
 * representations as well.
 *
 * @param verificationMethod - the VerificationMethod object (from a DID document)
 *
 * @returns a chain ID `number` or `undefined` if none could be extracted.
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export function getChainIdForDidEthr(verificationMethod: _NormalizedVerificationMethod): number {
  if (verificationMethod.blockchainAccountId?.includes('@eip155')) {
    return parseInt(verificationMethod.blockchainAccountId!.split(':').slice(-1)[0])
  } else if (verificationMethod.blockchainAccountId?.startsWith('eip155')) {
    return parseInt(verificationMethod.blockchainAccountId!.split(':')[1])
  }
  throw new Error('blockchainAccountId does not include eip155 designation')
}

/**
 * Maps the keys of a locally managed {@link @veramo/core-types#IIdentifier | IIdentifier} to the corresponding
 * {@link did-resolver#VerificationMethod | VerificationMethod} entries from the DID document.
 *
 * @param identifier - the identifier to be mapped
 * @param section - the section of the DID document to be mapped (see
 *   {@link https://www.w3.org/TR/did-core/#verification-relationships | verification relationships}), but can also be
 *   `verificationMethod` to map all the keys.
 * @param context - the veramo agent context, which must contain a {@link @veramo/core-types#IResolver | IResolver}
 *   implementation that can resolve the DID document of the identifier.
 *
 * @returns an array of mapped keys. The corresponding verification method is added to the `meta.verificationMethod`
 *   property of the key.
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export async function mapIdentifierKeysToDoc(
  identifier: IIdentifier,
  section: DIDDocumentSection = 'keyAgreement',
  context: IAgentContext<IResolver>,
): Promise<_ExtendedIKey[]> {
  const didDocument = await resolveDidOrThrow(identifier.did, context)
  // dereference all key agreement keys from DID document and normalize
  const documentKeys: _NormalizedVerificationMethod[] = await dereferenceDidKeys(
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
  const extendedKeys: _ExtendedIKey[] = documentKeys
    .map((verificationMethod) => {
      const localKey = localKeys.find(
        (localKey) =>
          localKey.publicKeyHex === verificationMethod.publicKeyHex ||
          compareBlockchainAccountId(localKey, verificationMethod),
      )
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

/**
 * Resolve a DID document or throw an error if the resolution fails.
 *
 * @param didUrl - the DID to be resolved
 * @param context - the veramo agent context, which must contain a {@link @veramo/core-types#IResolver | IResolver}
 *   implementation that can resolve the DID document of the `didUrl`.
 *
 * @returns a {@link did-resolver#DIDDocument | DIDDocument} if resolution is successful
 * @throws if the resolution fails
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
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
 * @returns a Promise that resolves to the list of dereferenced keys.
 *
 * @beta This API may change without a BREAKING CHANGE notice.
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
      const {
        publicKeyHex,
        publicKeyBase58,
        publicKeyMultibase,
        publicKeyBase64,
        publicKeyJwk,
        ...keyProps
      } = key
      const newKey = { ...keyProps, publicKeyHex: hexKey }

      // With a JWK `key`, `newKey` does not have information about crv (Ed25519 vs X25519)
      // Should type of `newKey` change?
      if (convert && 'Ed25519VerificationKey2018' === newKey.type) {
        newKey.type = 'X25519KeyAgreementKey2019'
      } else if (convert && 'Ed25519VerificationKey2020' === newKey.type) {
        newKey.type = 'X25519KeyAgreementKey2020'
      }

      return newKey
    })
}

/**
 * Converts the publicKey of a VerificationMethod to hex encoding (publicKeyHex)
 *
 * @param pk - the VerificationMethod to be converted
 * @param convert - when this flag is set to true, Ed25519 keys are converted to their X25519 pairs
 * @returns the hex encoding of the public key
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export function extractPublicKeyHex(pk: _ExtendedVerificationMethod, convert: boolean = false): string {
  let keyBytes = extractPublicKeyBytes(pk)
  if (convert) {
    if (
      ['Ed25519', 'Ed25519VerificationKey2018', 'Ed25519VerificationKey2020'].includes(pk.type) ||
      (pk.type === 'JsonWebKey2020' && pk.publicKeyJwk?.crv === 'Ed25519')
    ) {
      keyBytes = convertPublicKeyToX25519(keyBytes)
    } else if (
      !['X25519', 'X25519KeyAgreementKey2019', 'X25519KeyAgreementKey2020'].includes(pk.type) &&
      !(pk.type === 'JsonWebKey2020' && pk.publicKeyJwk?.crv === 'X25519')
    ) {
      return ''
    }
  }
  return u8a.toString(keyBytes, 'base16')
}
