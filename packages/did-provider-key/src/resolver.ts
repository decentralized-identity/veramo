import {
  DIDDocument,
  DIDResolutionOptions,
  DIDResolutionResult,
  DIDResolver,
  ParsedDID,
  Resolvable,
  VerificationMethod,
} from 'did-resolver'
import {
  bytesToBase58,
  bytesToMultibase,
  convertEd25519PublicKeyToX25519,
  createJWK,
  multibaseToBytes,
} from '@veramo/utils'

enum SupportedVerificationMethods {
  'JsonWebKey2020',
  'Multikey',
  'EcdsaSecp256k1VerificationKey2019', // deprecated,
  'EcdsaSecp256k1VerificationKey2020',
  'Ed25519VerificationKey2020',
  'Ed25519VerificationKey2018', // deprecated,
  'X25519KeyAgreementKey2020',
  'X25519KeyAgreementKey2019', // deprecated,
  'EcdsaSecp256r1VerificationKey2019',
}

export type DIDKeyResolverOptions = DIDResolutionOptions & {
  enableEncryptionKeyDerivation?: boolean // defaults to true
  publicKeyFormat?: keyof typeof SupportedVerificationMethods // defaults to 'JsonWebKey2020'
  // experimentalPublicKeyFormat?: false // not supported
  // defaultContext?: string[] // not supported
}

const contextFromKeyFormat: Record<keyof typeof SupportedVerificationMethods, string | object> = {
  JsonWebKey2020: 'https://w3id.org/security/suites/jws-2020/v1',
  Multikey: 'https://w3id.org/security/multikey/v1',
  EcdsaSecp256k1VerificationKey2020: 'https://w3id.org/security/suites/secp256k1-2020/v1',
  EcdsaSecp256k1VerificationKey2019: 'https://w3id.org/security/suites/secp256k1-2019/v1', // deprecated
  Ed25519VerificationKey2020: 'https://w3id.org/security/suites/ed25519-2020/v1',
  Ed25519VerificationKey2018: 'https://w3id.org/security/suites/ed25519-2018/v1', // deprecated
  X25519KeyAgreementKey2020: 'https://w3id.org/security/suites/x25519-2020/v1',
  X25519KeyAgreementKey2019: 'https://w3id.org/security/suites/x25519-2019/v1', // deprecated
  EcdsaSecp256r1VerificationKey2019: {
    EcdsaSecp256r1VerificationKey2019: 'https://w3id.org/security#EcdsaSecp256r1VerificationKey2019',
    publicKeyJwk: {
      '@id': 'https://w3id.org/security#publicKeyJwk',
      '@type': '@json',
    },
  },
}

function resolveECDSA(did: string, options: DIDKeyResolverOptions) {
  const publicKeyFormat = options?.publicKeyFormat ?? 'JsonWebKey2020'
  const keyMultibase = did.substring(8)
  const { keyBytes, keyType } = multibaseToBytes(keyMultibase)

  if (!keyType) {
    throw new Error(`invalidDid: the key type cannot be deduced for ${did}`)
  }

  const jwkKeyType = keyType === 'P-256' ? 'Secp256r1' : keyType

  let verificationMethod: VerificationMethod = {
    id: `${did}#${keyMultibase}`,
    type: publicKeyFormat,
    controller: did,
  }
  switch (publicKeyFormat) {
    case 'JsonWebKey2020':
    case 'EcdsaSecp256r1VerificationKey2019':
      verificationMethod.publicKeyJwk = createJWK(jwkKeyType as any, keyBytes, 'sig')
      break
    case 'Multikey':
    case 'EcdsaSecp256k1VerificationKey2019':
    case 'EcdsaSecp256k1VerificationKey2020':
      verificationMethod.publicKeyMultibase = keyMultibase
      break
    default:
      throw new Error(`invalidPublicKeyType: Unsupported public key format ${publicKeyFormat}`)
  }
  let ldContext = {}
  const acceptedFormat = options.accept ?? 'application/did+ld+json'
  if (options.accept === 'application/did+json') {
    ldContext = {}
  } else if (acceptedFormat === 'application/did+ld+json') {
    ldContext = {
      '@context': ['https://www.w3.org/ns/did/v1', contextFromKeyFormat[publicKeyFormat]],
    }
  } else {
    throw new Error(
      `unsupportedFormat: The DID resolver does not support the requested 'accept' format: ${options.accept}`,
    )
  }

  return {
    didResolutionMetadata: {},
    didDocumentMetadata: { contentType: options.accept ?? 'application/did+ld+json' },
    didDocument: {
      ...ldContext,
      id: did,
      verificationMethod: [verificationMethod],
      authentication: [verificationMethod.id],
      assertionMethod: [verificationMethod.id],
      capabilityDelegation: [verificationMethod.id],
      capabilityInvocation: [verificationMethod.id],
    },
  }
}

function resolveEDDSA(did: string, options: DIDKeyResolverOptions) {
  const publicKeyFormat = options?.publicKeyFormat ?? 'JsonWebKey2020'
  const keyMultibase = did.substring(8)
  const { keyBytes, keyType } = multibaseToBytes(keyMultibase)

  if (!keyType || keyType !== 'Ed25519') {
    throw new Error(`invalidDid: the key type cannot be deduced for ${did}`)
  }

  let verificationMethod: VerificationMethod = {
    id: `${did}#${keyMultibase}`,
    type: publicKeyFormat,
    controller: did,
  }
  let keyAgreementKeyFormat: keyof typeof SupportedVerificationMethods = publicKeyFormat

  switch (publicKeyFormat) {
    case 'JsonWebKey2020':
      verificationMethod.publicKeyJwk = createJWK(keyType as any, keyBytes, 'sig')
      break
    case 'Multikey':
      verificationMethod.publicKeyMultibase = keyMultibase
      break
    case 'Ed25519VerificationKey2020':
      keyAgreementKeyFormat = 'X25519KeyAgreementKey2020'
      verificationMethod.publicKeyMultibase = keyMultibase
      break
    case 'Ed25519VerificationKey2018':
      keyAgreementKeyFormat = 'X25519KeyAgreementKey2019'
      verificationMethod.publicKeyBase58 = bytesToBase58(keyBytes)
      break
    default:
      throw new Error(`invalidPublicKeyType: Unsupported public key format ${publicKeyFormat}`)
  }
  const ldContextArray: any[] = ['https://www.w3.org/ns/did/v1', contextFromKeyFormat[publicKeyFormat]]

  const result: DIDResolutionResult = {
    didResolutionMetadata: {},
    didDocumentMetadata: { contentType: options.accept ?? 'application/did+ld+json' },
    didDocument: {
      id: did,
      verificationMethod: [verificationMethod],
      authentication: [verificationMethod.id],
      assertionMethod: [verificationMethod.id],
      capabilityDelegation: [verificationMethod.id],
      capabilityInvocation: [verificationMethod.id],
    },
  }

  const useEncryptionKey = options.enableEncryptionKeyDerivation ?? true

  if (useEncryptionKey) {
    const encryptionKeyBytes = convertEd25519PublicKeyToX25519(keyBytes)
    const encryptionKeyMultibase = bytesToMultibase(encryptionKeyBytes, 'base58btc', 'x25519-pub')
    const encryptionKey: VerificationMethod = {
      id: `${did}#${encryptionKeyMultibase}`,
      type: keyAgreementKeyFormat,
      controller: did,
    }
    if (keyAgreementKeyFormat === 'JsonWebKey2020') {
      encryptionKey.publicKeyJwk = createJWK('X25519', encryptionKeyBytes, 'enc')
    } else if (keyAgreementKeyFormat === 'X25519KeyAgreementKey2019') {
      ldContextArray.push(contextFromKeyFormat[keyAgreementKeyFormat])
      encryptionKey.publicKeyBase58 = bytesToBase58(encryptionKeyBytes)
    } else {
      if (keyAgreementKeyFormat === 'X25519KeyAgreementKey2020') {
        ldContextArray.push(contextFromKeyFormat[keyAgreementKeyFormat])
      }
      encryptionKey.publicKeyMultibase = encryptionKeyMultibase
    }
    result.didDocument?.verificationMethod?.push(encryptionKey)
    result.didDocument!.keyAgreement = [encryptionKey.id]
  }

  let ldContext = {}
  const acceptedFormat = options.accept ?? 'application/did+ld+json'
  if (options.accept === 'application/did+json') {
    ldContext = {}
  } else if (acceptedFormat === 'application/did+ld+json') {
    ldContext = {
      '@context': ldContextArray,
    }
  } else {
    throw new Error(
      `unsupportedFormat: The DID resolver does not support the requested 'accept' format: ${options.accept}`,
    )
  }

  result.didDocument = { ...result.didDocument, ...ldContext } as DIDDocument

  return result
}

function resolveX25519(did: string, options: DIDKeyResolverOptions) {
  const publicKeyFormat = options?.publicKeyFormat ?? 'JsonWebKey2020'
  const keyMultibase = did.substring(8)
  const { keyBytes, keyType } = multibaseToBytes(keyMultibase)

  if (!keyType || keyType !== 'X25519') {
    throw new Error(`invalidDid: the key type cannot be deduced for ${did}`)
  }

  let verificationMethod: VerificationMethod = {
    id: `${did}#${keyMultibase}`,
    type: publicKeyFormat,
    controller: did,
  }

  switch (publicKeyFormat) {
    case 'JsonWebKey2020':
      verificationMethod.publicKeyJwk = createJWK(keyType as any, keyBytes, 'enc')
      break
    case 'Multikey':
    case 'X25519KeyAgreementKey2020':
      verificationMethod.publicKeyMultibase = keyMultibase
      break
    case 'X25519KeyAgreementKey2019':
      verificationMethod.publicKeyBase58 = bytesToBase58(keyBytes)
      break
    default:
      throw new Error(`invalidPublicKeyType: Unsupported public key format ${publicKeyFormat}`)
  }
  const ldContextArray = ['https://www.w3.org/ns/did/v1', contextFromKeyFormat[publicKeyFormat]]

  const result = {
    didResolutionMetadata: {},
    didDocumentMetadata: { contentType: options.accept ?? 'application/did+ld+json' },
    didDocument: {
      id: did,
      verificationMethod: [verificationMethod],
      keyAgreement: [verificationMethod.id],
    },
  }

  let ldContext = {}
  const acceptedFormat = options.accept ?? 'application/did+ld+json'
  if (options.accept === 'application/did+json') {
    ldContext = {}
  } else if (acceptedFormat === 'application/did+ld+json') {
    ldContext = {
      '@context': ldContextArray,
    }
  } else {
    throw new Error(
      `unsupportedFormat: The DID resolver does not support the requested 'accept' format: ${options.accept}`,
    )
  }

  result.didDocument = { ...result.didDocument, ...ldContext }

  return result
}

export const didPrefixMap: Record<string, Function> = {
  'did:key:z6Mk': resolveEDDSA,
  'did:key:z6LS': resolveX25519,
  'did:key:zQ3s': resolveECDSA, // compressed Secp256k1 keys
  'did:key:z7r8': resolveECDSA, // uncompressed Secp256k1 keys
  'did:key:zDn': resolveECDSA, // compressed P-256 keys
  // 'did:key:z82': resolveP384, // compressed P-384 keys - not supported yet
  // 'did:key:zUC7': resolveBLS12381, // BLS12381 keys - not supported yet
}

const resolveDidKey: DIDResolver = async (
  didUrl: string,
  _parsed: ParsedDID,
  _resolver: Resolvable,
  options: DIDKeyResolverOptions,
): Promise<DIDResolutionResult> => {
  try {
    const matchedResolver = Object.keys(didPrefixMap)
      .filter((prefix) => didUrl.startsWith(prefix))
      .shift()
    if (matchedResolver) {
      const didResolution = await didPrefixMap[matchedResolver](didUrl, options)
      return {
        didDocumentMetadata: {},
        didResolutionMetadata: {},
        ...didResolution,
      }
    } else {
      return {
        didDocumentMetadata: {},
        didResolutionMetadata: { error: 'invalidDid', message: 'unsupported key type for did:key' },
        didDocument: null,
      }
    }
  } catch (err: any) {
    return {
      didDocumentMetadata: {},
      didResolutionMetadata: { error: 'invalidDid', message: err.toString() },
      didDocument: null,
    }
  }
}

/**
 * Provides a mapping to a did:key resolver, usable by {@link did-resolver#Resolver}.
 *
 * @public
 */
export function getDidKeyResolver() {
  return { key: resolveDidKey }
}
