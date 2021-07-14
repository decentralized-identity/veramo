import { resolve } from '@transmute/did-key.js'
import { DIDResolutionOptions, DIDResolutionResult, DIDResolver, ParsedDID, Resolvable } from 'did-resolver'

const resolveDidKey: DIDResolver = async (
  didUrl: string,
  _parsed: ParsedDID,
  _resolver: Resolvable,
  options: DIDResolutionOptions,
): Promise<DIDResolutionResult> => {
  try {
    const didResolution = (await resolve(didUrl, options as any)) as DIDResolutionResult
    return didResolution
  } catch (err) {
    return {
      didDocumentMetadata: {},
      didResolutionMetadata: { error: 'invalidDid', message: err.toString() },
      didDocument: null,
    }
  }
}

export function getDidKeyResolver() {
  return { key: resolveDidKey }
}
