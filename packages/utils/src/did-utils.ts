import { computeAddress, SigningKey } from 'ethers'
import { DIDDocumentSection, IAgentContext, IIdentifier, IKey, IResolver } from '@veramo/core-types'
import { DIDDocument, DIDResolutionOptions, VerificationMethod } from 'did-resolver'
import { extractPublicKeyBytes } from 'did-jwt'
import {
  _ExtendedIKey,
  _ExtendedVerificationMethod,
  _NormalizedVerificationMethod,
} from './types/utility-types.js'
import { isDefined } from './type-utils.js'
import Debug from 'debug'
import { bytesToHex, hexToBytes } from './encodings.js'
import { ed25519 } from '@noble/curves/ed25519'

const debug = Debug('veramo:utils')

/**
 * Converts Ed25519 public keys to X25519
 * @param publicKey - The bytes of an Ed25519P public key
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export function convertEd25519PublicKeyToX25519(publicKey: Uint8Array): Uint8Array {
  // FIXME: Once https://github.com/paulmillr/noble-curves/issues/31 gets released, this code can be simplified
  const Fp = ed25519.CURVE.Fp
  const { y } = ed25519.ExtendedPoint.fromHex(publicKey)
  const _1n = BigInt(1)
  return Fp.toBytes(Fp.create((_1n + y) * Fp.inv(_1n - y)))
}

/**
 * Converts Ed25519 private keys to X25519
 * @param privateKey - The bytes of an Ed25519P private key
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export function convertEd25519PrivateKeyToX25519(privateKey: Uint8Array): Uint8Array {
  // FIXME: Once https://github.com/paulmillr/noble-curves/issues/31 gets released, this code can be simplified
  const hashed = ed25519.CURVE.hash(privateKey.subarray(0, 32))
  return ed25519?.CURVE?.adjustScalarBytes?.(hashed)?.subarray(0, 32) ?? new Uint8Array(0)
}

/**
 * Converts any Ed25519 keys of an {@link @veramo/core-types#IIdentifier | IIdentifier} to X25519 to be usable for
 * encryption.
 *
 * @param identifier - the identifier with keys
 *
 * @returns the array of converted keys filtered to contain ONLY X25519 keys usable for encryption.
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export function convertIdentifierEncryptionKeys(identifier: IIdentifier): IKey[] {
  return identifier.keys
    .map((key: IKey) => {
      if (key.type === 'Ed25519') {
        const publicBytes = hexToBytes(key.publicKeyHex)
        key.publicKeyHex = bytesToHex(convertEd25519PublicKeyToX25519(publicBytes))
        if (key.privateKeyHex) {
          const privateBytes = hexToBytes(key.privateKeyHex)
          key.privateKeyHex = bytesToHex(convertEd25519PrivateKeyToX25519(privateBytes))
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
 * Converts any Secp256k1 public keys of an {@link @veramo/core-types#IIdentifier | IIdentifier} to their compressed
 * form.
 *
 * @param identifier - the identifier with keys
 *
 * @returns the array of keys where the Secp256k1 entries are compressed.
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export function compressIdentifierSecp256k1Keys(identifier: IIdentifier): IKey[] {
  return identifier.keys
    .map((key: IKey) => {
      if (key.type === 'Secp256k1') {
        if (key.publicKeyHex) {
          const publicBytes = hexToBytes(key.publicKeyHex)
          key.publicKeyHex = SigningKey.computePublicKey(publicBytes, true).substring(2)
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
  if (localKey.type !== 'Secp256k1') {
    return false
  }
  let vmEthAddr = getEthereumAddress(verificationMethod)
  const localAccount = localKey.meta?.account ?? localKey.meta?.ethereumAddress
  if (localKey.meta?.account) {
    return vmEthAddr === localAccount.toLowerCase()
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
    } else {
      const { keyBytes, keyType } = extractPublicKeyBytes(verificationMethod)
      if (keyType !== 'Secp256k1') {
        return undefined
      }
      const pbHex = SigningKey.computePublicKey(keyBytes, false)

      vmEthAddr = computeAddress(pbHex).toLowerCase()
    }
  }
  return vmEthAddr
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
export function getChainId(verificationMethod: _NormalizedVerificationMethod): number {
  let result
  if (verificationMethod.blockchainAccountId?.includes('@eip155')) {
    result = parseInt(verificationMethod.blockchainAccountId!.split(':').slice(-1)[0])
  } else if (verificationMethod.blockchainAccountId?.startsWith('eip155')) {
    result = parseInt(verificationMethod.blockchainAccountId!.split(':')[1])
  }
  if (!Number.isInteger(result)) {
    throw new Error('chainId is not a number')
  }
  if (result) {
    return result
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
 * @param resolutionOptions - optional parameters to be passed to the DID resolver
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
  resolutionOptions?: DIDResolutionOptions,
): Promise<_ExtendedIKey[]> {
  const didDocument = await resolveDidOrThrow(identifier.did, context, resolutionOptions)
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
        (localKey: IKey) =>
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
 * @param resolutionOptions - optional parameters to be passed to the DID resolver
 *
 * @returns a {@link did-resolver#DIDDocument | DIDDocument} if resolution is successful
 * @throws if the resolution fails
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export async function resolveDidOrThrow(
  didUrl: string,
  context: IAgentContext<IResolver>,
  resolutionOptions?: DIDResolutionOptions,
): Promise<DIDDocument> {
  // TODO: add caching
  const docResult = await context.agent.resolveDid({ didUrl: didUrl, options: resolutionOptions })
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
      const { publicKeyHex: hexKey, keyType } = extractPublicKeyHex(key, convert)
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
      if (convert) {
        if ('Ed25519VerificationKey2018' === newKey.type) {
          newKey.type = 'X25519KeyAgreementKey2019'
        } else if ('Ed25519VerificationKey2020' === newKey.type || 'X25519' === keyType) {
          newKey.type = 'X25519KeyAgreementKey2020'
        }
      }

      return newKey
    })
}

/**
 * Converts the publicKey of a VerificationMethod to hex encoding (publicKeyHex)
 *
 * @param pk - the VerificationMethod to be converted
 * @param convert - when this flag is set to true, Ed25519 keys are converted to their X25519 pairs
 * @returns the hex encoding of the public key along with the inferred key type
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export function extractPublicKeyHex(
  pk: _ExtendedVerificationMethod,
  convert: boolean = false,
): {
  publicKeyHex: string
  keyType: string | undefined
} {
  let { keyBytes, keyType } = extractPublicKeyBytes(pk)
  if (convert) {
    if (keyType === 'Ed25519') {
      keyBytes = convertEd25519PublicKeyToX25519(keyBytes)
      keyType = 'X25519'
    }
  }
  return { publicKeyHex: bytesToHex(keyBytes), keyType }
}
