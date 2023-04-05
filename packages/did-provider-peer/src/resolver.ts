import { DIDDocument, DIDResolutionResult, DIDResolver, ParsedDID } from 'did-resolver'
import { resolve } from '@aviarytech/did-peer'
import { IDIDDocumentServiceDescriptor } from '@aviarytech/did-peer/interfaces.js'

export function getResolver(): Record<string, DIDResolver> {
  async function resolveInner(did: string, parsed: ParsedDID): Promise<DIDResolutionResult> {
    const didDocumentMetadata = {}
    let didDocument: DIDDocument | null = null
    let err = ''
    do {
      try {
        const doc = await resolve(did)
        didDocument = {
          '@context': doc['@context'],
          id: doc.id,
          verificationMethod: doc.verificationMethod,
          keyAgreement: doc.keyAgreement,
          authentication: doc.authentication,
          assertionMethod: doc.assertionMethod,
          capabilityInvocation: doc.capabilityInvocation,
          capabilityDelegation: doc.capabilityDelegation,
          service: doc.service as IDIDDocumentServiceDescriptor[],
        }
        if (doc.alsoKnownAs) {
          didDocument.alsoKnownAs = [doc.alsoKnownAs]
        }
        if (doc.controller) {
          didDocument.controller = doc.controller
        }
      } catch (error) {
        err = `resolver_error: DID must resolve to a valid https URL containing a JSON document: ${error}`
        break
      }

      // TODO: this excludes the use of query params
      const docIdMatchesDid = didDocument?.id === did
      if (!docIdMatchesDid) {
        err = 'resolver_error: DID document id does not match requested did'
        // break // uncomment this when adding more checks
      }
      // eslint-disable-next-line no-constant-condition
    } while (false)

    const contentType =
      typeof didDocument?.['@context'] !== 'undefined' ? 'application/did+ld+json' : 'application/did+json'

    if (err) {
      return {
        didDocument,
        didDocumentMetadata,
        didResolutionMetadata: {
          error: 'notFound',
          message: err,
        },
      }
    } else {
      return {
        didDocument,
        didDocumentMetadata,
        didResolutionMetadata: { contentType },
      }
    }
  }

  return { peer: resolveInner }
}
