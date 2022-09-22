import { resolve as resolveED25519 } from '@transmute/did-key-ed25519'
import { resolve as resolveX25519 } from '@transmute/did-key-x25519'
import { resolve as resolveSecp256k1 } from '@transmute/did-key-secp256k1'
import { DIDResolutionOptions, DIDResolutionResult, DIDResolver, ParsedDID, Resolvable } from 'did-resolver'

export const startsWithMap: Record<string, Function> = {
  'did:key:z6Mk': resolveED25519,
  'did:key:z6LS': resolveX25519,
  'did:key:zQ3s': resolveSecp256k1,
}

const resolveDidKey: DIDResolver = async (
  didUrl: string,
  _parsed: ParsedDID,
  _resolver: Resolvable,
  options: DIDResolutionOptions,
): Promise<DIDResolutionResult> => {
  try {
    const startsWith = _parsed.did.substring(0, 12)
    if (startsWithMap[startsWith] !== undefined) {
      const didResolution = await startsWithMap[startsWith](didUrl, options as any)
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
