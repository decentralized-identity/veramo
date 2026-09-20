import { IAgentContext, IDIDManager, IIdentifier, IKeyManager, IResolver, TKeyType } from '@veramo/core-types'
import { ECDH, JWE } from 'did-jwt'
import { DIDResolutionOptions, parse as parseDidUrl } from 'did-resolver'

import Debug from 'debug'
import {
  _ExtendedVerificationMethod,
  bytesToBase64url,
  bytesToHex,
  decodeJoseBlob,
  extractPublicKeyHex,
  hexToBytes,
  isDefined,
  mapIdentifierKeysToDoc,
  resolveDidOrThrow,
  stringToUtf8Bytes,
} from '@veramo/utils'
import { x25519 } from '@noble/curves/ed25519'
import { sha256 } from '@noble/hashes/sha256'

const debug = Debug('veramo:did-comm:action-handler')

/**
 * Computes the `apv` JWE protected header value for a DIDComm v2 message.
 *
 * The DIDComm messaging spec defines it, for both ECDH-ES and ECDH-1PU, as the base64url (no padding)
 * encoding of the SHA-256 hash of the alphanumerically sorted recipient `kid` list, concatenated with `.`.
 *
 * @param kids - the `kid` of every recipient of the message
 */
export function computeApv(kids: string[]): string {
  return bytesToBase64url(sha256(stringToUtf8Bytes([...kids].sort().join('.'))))
}

export function createEcdhWrapper(secretKeyRef: string, context: IAgentContext<IKeyManager>): ECDH {
  return async (theirPublicKey: Uint8Array): Promise<Uint8Array> => {
    if (theirPublicKey.length !== 32) {
      throw new Error('invalid_argument: incorrect publicKey key length for X25519')
    }
    const publicKey = { type: <TKeyType>'X25519', publicKeyHex: bytesToHex(theirPublicKey) }
    const shared = await context.agent.keyManagerSharedSecret({ secretKeyRef, publicKey })
    return hexToBytes(shared)
  }
}

export async function extractSenderEncryptionKey(
  jwe: JWE,
  context: IAgentContext<IResolver>,
  resolutionOptions?: DIDResolutionOptions,
): Promise<Uint8Array | null> {
  let senderKey: Uint8Array | null = null
  const protectedHeader = decodeJoseBlob(jwe.protected)
  if (typeof protectedHeader.skid === 'string') {
    const senderDoc = await resolveDidOrThrow(protectedHeader.skid, context, resolutionOptions)
    const sKey = (await context.agent.getDIDComponentById({
      didDocument: senderDoc,
      didUrl: protectedHeader.skid,
      section: 'keyAgreement',
    })) as _ExtendedVerificationMethod
    let { publicKeyHex, keyType } = extractPublicKeyHex(sKey, true)
    if (keyType !== 'X25519') {
      throw new Error(`not_supported: sender key of type ${sKey.type} is not supported`)
    }
    senderKey = hexToBytes(publicKeyHex)
  }
  return senderKey
}

export async function extractManagedRecipients(
  jwe: JWE,
  context: IAgentContext<IDIDManager>,
): Promise<{ recipient: any; kid: string; identifier: IIdentifier }[]> {
  const parsedDIDs = (jwe.recipients || [])
    .map((recipient) => {
      const kid = recipient?.header?.kid
      const did = parseDidUrl(kid || '')?.did as string
      if (kid && did) {
        return { recipient, kid, did }
      } else {
        return null
      }
    })
    .filter(isDefined)

  let managedRecipients = (
    await Promise.all(
      parsedDIDs.map(async ({ recipient, kid, did }) => {
        try {
          const identifier = await context.agent.didManagerGet({ did })
          return { recipient, kid, identifier }
        } catch (e) {
          // identifier not found, skip it
          return null
        }
      }),
    )
  ).filter(isDefined)
  return managedRecipients
}

export async function mapRecipientsToLocalKeys(
  managedKeys: { recipient: any; kid: string; identifier: IIdentifier }[],
  context: IAgentContext<IResolver>,
  resolutionOptions?: DIDResolutionOptions,
): Promise<{ localKeyRef: string; recipient: any }[]> {
  const potentialKeys = await Promise.all(
    managedKeys.map(async ({ recipient, kid, identifier }) => {
      // TODO: use caching, since all recipients are supposed to belong to the same identifier
      const identifierKeys = await mapIdentifierKeysToDoc(
        identifier,
        'keyAgreement',
        context,
        resolutionOptions,
      )
      const localKey = identifierKeys.find((key) => key.meta.verificationMethod.id === kid)
      if (localKey) {
        return { localKeyRef: localKey.kid, recipient }
      } else {
        return null
      }
    }),
  )
  const localKeys = potentialKeys.filter(isDefined)
  return localKeys
}

/**
 * Generate private-public x25519 key pair
 */
export function generateX25519KeyPair(): { secretKey: Uint8Array; publicKey: Uint8Array } {
  const secretKey = x25519.utils.randomPrivateKey()
  return generateX25519KeyPairFromSeed(secretKey)
}

/**
 * Generate private-public x25519 key pair from a 32 byte secret.
 */
export function generateX25519KeyPairFromSeed(seed: Uint8Array): {
  secretKey: Uint8Array
  publicKey: Uint8Array
} {
  if (seed.length !== 32) {
    throw new Error(`x25519: seed must be 32 bytes`)
  }
  return {
    publicKey: x25519.getPublicKey(seed),
    secretKey: seed,
  }
}
