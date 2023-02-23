import { DIDResolutionOptions, DIDResolutionResult, DIDResolver, ParsedDID, Resolvable } from 'did-resolver'

const resolveDidVda: DIDResolver = async (
  didUrl: string,
  _parsed: ParsedDID,
  _resolver: Resolvable,
  options: DIDResolutionOptions,
): Promise<DIDResolutionResult> => {
  return { didDocument: null, didDocumentMetadata: {}, didResolutionMetadata: { error: 'not_implemented' } }
}

/**
 * Provides a mapping to a did:vda resolver, usable by {@link did-resolver#Resolver}.
 *
 * @public
 */
export function getDidVdaResolver() {
  return { vda: resolveDidVda }
}
