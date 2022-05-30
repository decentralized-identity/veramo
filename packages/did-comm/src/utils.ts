import { IAgentContext, IDIDManager, IIdentifier, IKeyManager, IResolver, TKeyType } from '@veramo/core'
import { ECDH, JWE } from 'did-jwt'
import { parse as parseDidUrl } from 'did-resolver'
import * as u8a from 'uint8arrays'

import Debug from 'debug'
import {
  _ExtendedIKey,
  _ExtendedVerificationMethod,
  _NormalizedVerificationMethod,
  decodeJoseBlob,
  isDefined,
  mapIdentifierKeysToDoc,
  resolveDidOrThrow,
  extractPublicKeyHex,
} from '@veramo/utils'

const debug = Debug('veramo:did-comm:action-handler')

export function createEcdhWrapper(secretKeyRef: string, context: IAgentContext<IKeyManager>): ECDH {
  return async (theirPublicKey: Uint8Array): Promise<Uint8Array> => {
    if (theirPublicKey.length !== 32) {
      throw new Error('invalid_argument: incorrect publicKey key length for X25519')
    }
    const publicKey = { type: <TKeyType>'X25519', publicKeyHex: u8a.toString(theirPublicKey, 'base16') }
    const shared = await context.agent.keyManagerSharedSecret({ secretKeyRef, publicKey })
    return u8a.fromString(shared, 'base16')
  }
}

export async function extractSenderEncryptionKey(
  jwe: JWE,
  context: IAgentContext<IResolver>,
): Promise<Uint8Array | null> {
  let senderKey: Uint8Array | null = null
  const protectedHeader = decodeJoseBlob(jwe.protected)
  if (typeof protectedHeader.skid === 'string') {
    const senderDoc = await resolveDidOrThrow(protectedHeader.skid, context)
    const sKey = (await context.agent.getDIDComponentById({
      didDocument: senderDoc,
      didUrl: protectedHeader.skid,
      section: 'keyAgreement',
    })) as _ExtendedVerificationMethod
    if (!['Ed25519VerificationKey2018', 'X25519KeyAgreementKey2019'].includes(sKey.type)) {
      throw new Error(`not_supported: sender key of type ${sKey.type} is not supported`)
    }
    let publicKeyHex = extractPublicKeyHex(sKey, true)
    senderKey = u8a.fromString(publicKeyHex, 'base16')
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
): Promise<{ localKeyRef: string; recipient: any }[]> {
  const potentialKeys = await Promise.all(
    managedKeys.map(async ({ recipient, kid, identifier }) => {
      // TODO: use caching, since all recipients are supposed to belong to the same identifier
      const identifierKeys = await mapIdentifierKeysToDoc(identifier, 'keyAgreement', context)
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
