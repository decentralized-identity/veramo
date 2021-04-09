import { resolver } from '@transmute/did-key.js'
import { DIDDocument } from '@veramo/core'
import { DIDResolutionOptions, DIDResolutionResult, DIDResolver, ParsedDID, Resolvable } from 'did-resolver'

const resolve: DIDResolver = async (
  didUrl: string,
  _parsed: ParsedDID,
  _resolver: Resolvable,
  options: DIDResolutionOptions,
): Promise<DIDResolutionResult> => {
  try {
    const didDocument = (await resolver.resolve(didUrl, options)) as DIDDocument
    return {
      didDocumentMetadata: {},
      didResolutionMetadata: { contentType: 'application/did+ld+json' },
      didDocument,
    }
  } catch (err) {
    return {
      didDocumentMetadata: {},
      didResolutionMetadata: { error: 'invalidDid', message: err.toString() },
      didDocument: null,
    }
  }
}

export function getDidKeyResolver() {
  return { key: resolve }
}
