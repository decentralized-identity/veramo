import {
  IonKeyMetadata,
  ISecp256k1PrivateKeyJwk,
  ISecp256k1PublicKeyJwk,
  KeyIdentifierRelation,
  KeyType,
} from './types/ion-provider-types'
import { IonDid, IonDocumentModel, IonPublicKeyModel, IonPublicKeyPurpose, JwkEs256k } from '@decentralized-identity/ion-sdk'
import { computePublicKey } from '@ethersproject/signing-key'
import { IKey, ManagedKeyInfo } from '@veramo/core'
import keyto from '@trust/keyto';
import { randomBytes } from '@ethersproject/random'
import * as u8a from 'uint8arrays'
import { generateKeyPair as generateSigningKeyPair } from '@stablelib/ed25519'
import Debug from 'debug'
import { JsonCanonicalizer } from './json-canonicalizer'
import { MemoryPrivateKeyStore } from '@veramo/key-manager'
import { KeyManagementSystem } from '@veramo/kms-local'
import { hash } from '@stablelib/sha256'

const multihashes = require('multihashes')

const debug = Debug('veramo:did-provider-ion')

const MULTI_HASH_SHA256_LITERAL = 18

/**
 * Ensures we only return Jwk properties that ION can handle
 *
 * @param jwk The input JWK
 * @return The sanitized JWK
 */
export const toJwkEs256k = (jwk: any): JwkEs256k => {
  if (jwk.d) {
    return { kty: jwk.kty, crv: jwk.crv, x: jwk.x, y: jwk.y, d: jwk.d }
  } else {
    return { kty: jwk.kty, crv: jwk.crv, x: jwk.x, y: jwk.y }
  }
}

/**
 * Create a JWK from a hex private Key
 * @param privateKeyHex The private key in hex form
 * @return The JWK
 */
export const toIonPrivateKeyJwk = (privateKeyHex: string): JwkEs256k => {
  return toJwkEs256k(privateKeyJwkFromPrivateKeyHex(privateKeyHex))
}

/**
 * Create a JWK from a hex public Key
 * @param privateKeyHex The public key in hex form
 * @return The JWK
 */
export const toIonPublicKeyJwk = (publicKeyHex: string): JwkEs256k => {
  return toJwkEs256k(publicKeyJwkFromPublicKeyHex(publicKeyHex))
}

/**
 * Example
 * ```js
 * {
 *  kty: 'EC',
 *  crv: 'secp256k1',
 *  d: 'rhYFsBPF9q3-uZThy7B3c4LDF_8wnozFUAEm5LLC4Zw',
 *  x: 'dWCvM4fTdeM0KmloF57zxtBPXTOythHPMm1HCLrdd3A',
 *  y: '36uMVGM7hnw-N6GnjFcihWE3SkrhMLzzLCdPMXPEXlA',
 *  kid: 'JUvpllMEYUZ2joO59UNui_XYDqxVqiFLLAJ8klWuPBw'
 * }
 * ```
 * See [rfc7638](https://tools.ietf.org/html/rfc7638) for more details on Jwk.
 */
export const getKid = (
  jwk: ISecp256k1PrivateKeyJwk | ISecp256k1PublicKeyJwk
) => {
  const copy = { ...jwk } as any;
  delete copy.d;
  delete copy.kid;
  delete copy.alg;
  const digest = hash(u8a.fromString(JsonCanonicalizer.asString(copy), 'utf-8'));
  return u8a.toString(digest, 'base64url')
};

/** convert compressed hex encoded private key to jwk */
const privateKeyJwkFromPrivateKeyHex = (privateKeyHex: string) => {
  const jwk = {
    ...keyto.from(privateKeyHex, 'blk').toJwk('private'),
    crv: 'secp256k1',
  };
  const kid = getKid(jwk);
  return {
    ...jwk,
    kid,
  };
};

/** convert compressed hex encoded public key to jwk */
const publicKeyJwkFromPublicKeyHex = (publicKeyHex: string) => {
  let key = publicKeyHex;
  const compressedHexEncodedPublicKeyLength = 66;
  if (publicKeyHex.length === compressedHexEncodedPublicKeyLength) {
    const publicBytes = u8a.fromString(publicKeyHex, 'base16')
    key = computePublicKey(publicBytes, true).substring(2)
  }
  const jwk = {
    ...keyto.from(key, 'blk').toJwk('public'),
    crv: 'secp256k1',
  };
  const kid = getKid(jwk);

  return {
    ...jwk,
    kid,
  };
};


/**
 * Computes the ION Commitment value from a ION public key
 *
 * @param ionKey The ion public key
 * @return The ION commitment value
 */
export const computeCommitmentFromIonPublicKey = (ionKey: IonPublicKeyModel): string => {
  return computeCommitmentFromJwk(toJwkEs256k(ionKey.publicKeyJwk))
}

/**
 * Computes the ION Commitment from a JWK
 *
 * @param jwk The JWK to computate the commitment for
 */
export const computeCommitmentFromJwk = (jwk: JwkEs256k): string => {
  const data = JsonCanonicalizer.asString(jwk)
  debug(`canonicalized JWK: ${data}`)
  const singleHash = hash(u8a.fromString(data))
  const doubleHash = hash(singleHash)

  const multiHash = multihashes.encode(doubleHash, MULTI_HASH_SHA256_LITERAL)
  const commitment = u8a.toString(multiHash, 'base64url')
  debug(`commitment: ${commitment}`)
  return commitment
}

/**
 * Get the action timestamp if present. Use current date/timestamp otherwise
 * @param timestamp An optional provided timestamp, useful only in case a key needs to be inserted in between other keys
 * @return The action timestamp
 */
export const getActionTimestamp = (timestamp = Date.now()): number => {
  return timestamp
}

/**
 * Gets a specific recovery key matching the commitment value, typically coming from a DID document, or the latest recovery key in case it is not provided
 *
 * @param keys The actual keys related to an identifier
 * @param commitment An optional commitment value to match the recovery key against. Typically comes from a DID Document
 * @return The ION Recovery Public Key
 */
export const getVeramoRecoveryKey = (keys: IKey[], commitment?: string): IKey => {
  const typedKeys = veramoKeysOfType(keys, KeyIdentifierRelation.RECOVERY, commitment)
  return commitment === 'genesis' ? typedKeys[0] : typedKeys[typedKeys.length - 1]
}

/**
 * Gets a specific update key matching the commitment value, typically coming from a DID document, or the latest update key in case it is not provided
 *
 * @param keys The actual keys related to an identifier
 * @param commitment An optional commitment value to match the update key against. Typically comes from a DID Document
 * @return The Veramo Update Key
 */
export const getVeramoUpdateKey = (keys: IKey[], commitment?: string): IKey => {
  const typedKeys = veramoKeysOfType(keys, KeyIdentifierRelation.UPDATE, commitment)
  return commitment === 'genesis' ? typedKeys[0] : typedKeys[typedKeys.length - 1]
}

/**
 * Get the Ion Public keys from Veramo which have a specific relation type. If the commitment value is set the Key belonging to that value will be returned, otherwise the latest key
 * @param keys The Veramo Keys to inspect
 * @param relation The Key relation ship type
 * @param commitment An optional commitment value, typically coming from a DID Document. The value 'genisis' returns the first key found
 */
export const ionKeysOfType = (keys: IKey[], relation: KeyIdentifierRelation, commitment?: string): IonPublicKeyModel[] => {
  return veramoKeysOfType(keys, relation, commitment).flatMap((key) => {
    return toIonPublicKey(key)
  })
}

/**
 * Get the Veramo keys which have a specific relation type. If the commitment value is set the Key belonging to that value will be returned, otherwise the latest key
 * @param keys The Veramo Keys to inspect
 * @param relation The Key relation ship type
 * @param commitment An optional commitment value, typically coming from a DID Document. The value 'genisis' returns the first key found
 */
export const veramoKeysOfType = (keys: IKey[], relation: KeyIdentifierRelation, commitment?: string): IKey[] => {
  return keys
    .sort((key1, key2) => {
      const opId1 = key1.meta?.ion?.operationId
      const opId2 = key2.meta?.ion?.operationId
      return !opId1 ? 1 : !opId2 ? -1 : opId1 - opId2
    })
    .filter((key) => !commitment || commitment === 'genesis' || !key.meta?.ion.commitment || key.meta?.ion.commitment === commitment)
    .filter((key) => key.meta?.ion.relation === relation)
    .flatMap((keys) => keys)
}

/**
 * Ion/Sidetree only supports kid with a maximum length of 50 characters. This method truncates longer keys when create ION requests
 *
 * @param kid The Veramo kid
 * @return A truncated kid if the input kid contained more than 50 characters
 */
export const truncateKidIfNeeded = (kid: string): string => {
  const id = kid.substring(0, 50) // ION restricts the id to 50 chars. Ideally we can also provide kids for key creation in Veramo
  if (id.length != kid.length) {
    debug(`Key kid ${kid} has been truncated to 50 chars to support ION!`)
  }
  return id
}

/**
 * Creates an Ion Public Key (Verification Method), used in ION request from a Veramo Key
 * @param key The Veramo Key
 * @param createKeyPurposes The verification relationships (Sidetree calls them purposes) to explicitly set. Used during key creation
 * @return An Ion Public Key which can be used in Ion request objects
 */
export const toIonPublicKey = (key: ManagedKeyInfo, createKeyPurposes?: IonPublicKeyPurpose[]): IonPublicKeyModel => {
  const purposes: IonPublicKeyPurpose[] = createKeyPurposes ? createKeyPurposes : key.meta?.ion?.purposes ? key.meta.ion.purposes : []
  const publicKeyJwk = toIonPublicKeyJwk(key.publicKeyHex)
  const id = truncateKidIfNeeded(key.kid)

  return {
    id,
    type: 'EcdsaSecp256k1VerificationKey2019',
    publicKeyJwk,
    purposes,
  }
}

/**
 * Generates a random Private Hex Key for the specified key type
 * @param type The key type
 * @return The private key in Hex form
 */
export const generatePrivateKeyHex = (type: KeyType): string => {
  let privateKeyHex: string

  switch (type) {
    case KeyType.Ed25519: {
      const keyPairEd25519 = generateSigningKeyPair()
      privateKeyHex = u8a.toString(keyPairEd25519.secretKey, 'base16')
      break
    }
    case KeyType.Secp256k1: {
      const privateBytes = randomBytes(32)
      privateKeyHex = u8a.toString(privateBytes, 'base16')
      break
    }
    default:
      throw Error('not_supported: Key type not supported: ' + type)
  }
  return privateKeyHex
}

/**
 * Create a Veramo Key entirely in Memory. It is not stored
 *
 * Didn't want to recreate the logic to extract the pub key for the different key types
 * So let's create a temp in-mem kms to do it for us
 *
 * @param type
 * @param privateKeyHex
 * @param kid
 * @param kms
 * @param ionMeta
 */
export const tempMemoryKey = async (
  type: KeyType.Ed25519 | KeyType.Secp256k1 | KeyType,
  privateKeyHex: string,
  kid: string,
  kms: string,
  ionMeta: IonKeyMetadata
): Promise<IKey> => {
  const tmpKey = (await new KeyManagementSystem(new MemoryPrivateKeyStore()).importKey({
    type,
    privateKeyHex,
    kid,
  })) as IKey
  tmpKey.meta!.ion = JSON.parse(JSON.stringify(ionMeta))
  tmpKey.meta!.ion.commitment = computeCommitmentFromJwk(toIonPublicKeyJwk(tmpKey.publicKeyHex))
  tmpKey.kms = kms
  // tmpKey.privateKeyHex = privateKeyHex
  return tmpKey
}

/**
 * Generate a deterministic Ion Long form DID from the creation keys
 *
 * @param input The creation keys
 * @return The Ion Long form DID
 */
export const ionLongFormDidFromCreation = async (input: { recoveryKey: JwkEs256k; updateKey: JwkEs256k; document: IonDocumentModel }): Promise<string> => {
  return await IonDid.createLongFormDid(input)
}

/**
 * Generate a deterministic Ion Short form DID from the creation keys
 *
 * @param input The creation keys
 * @return The Ion Short form DID
 */
export const ionShortFormDidFromCreation = async (input: { recoveryKey: JwkEs256k; updateKey: JwkEs256k; document: IonDocumentModel }): Promise<string> => {
  return  ionShortFormDidFromLong(await ionLongFormDidFromCreation(input))
}

/**
 * Convert an Ion Long form DID into a short form DID. Be aware that the input really needs to be a long Form DID!
 * @param longFormDid The Ion Long form DID
 * @return An Ion Short form DID
 */
export const ionShortFormDidFromLong = (longFormDid: string): string => {
  // Only call this from a long form DID!

  // todo: Add min length check
  return longFormDid.split(':').slice(0, -1).join(':')
}

/**
 * Gets the method specific Short form Id from the Long form DID. So the did: prefix and Ion Long Form suffix have been removed
 * @param longFormDid The Ion Long form DID
 * @return The Short form method specific Id
 */
export const ionDidSuffixFromLong = (longFormDid: string): string => {
  return ionDidSuffixFromShort(ionShortFormDidFromLong(longFormDid))
}

/**
 * Gets the method specific Short form Id from the Short form DID. So the did: prefix has been removed
 * @param shortFormDid The Ion Short form DID
 * @return The Short form method specific Id
 */
export const ionDidSuffixFromShort = (shortFormDid: string): string => {
  const suffix = shortFormDid.split(':').pop()
  if (!suffix) {
    throw new Error(`Could not extract ion DID suffix from short form DID ${shortFormDid}`)
  }
  return suffix
}
