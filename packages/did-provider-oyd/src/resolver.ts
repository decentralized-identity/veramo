import { DIDResolutionOptions, DIDResolutionResult, DIDResolver, ParsedDID, Resolvable } from 'did-resolver'
import fetch from 'cross-fetch';

const resolveDidOyd: DIDResolver = async (
  didUrl: string,
  _parsed: ParsedDID,
  _resolver: Resolvable,
  options: DIDResolutionOptions,
): Promise<DIDResolutionResult> => {
  try {
    const baseUrl: string = 'https://oydid-resolver.data-container.net';
    // const didDoc = await axios.get(`${baseUrl}/1.0/identifiers/${didUrl}`);
    const response = await fetch(`${baseUrl}/1.0/identifiers/${didUrl}`);
    if (!response.ok) {
      throw new Error('Network response was not ok: ' + response.statusText);
    }
    const didDoc = await response.json();
    return (didDoc as DIDResolutionResult);
  } catch (err: any) {
    return {
      didDocumentMetadata: {},
      didResolutionMetadata: { error: 'invalidDid', message: err.toString() },
      didDocument: null,
    }
  }
}

/**
 * Provides a mapping to a did:oyd resolver, usable by {@link did-resolver#Resolver}.
 *
 * @public
 */
export function getDidOydResolver() {
  return { oyd: resolveDidOyd }
}
