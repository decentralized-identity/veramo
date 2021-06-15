import { DIDDocumentSection, IAgentPlugin, IResolver, schema } from '@veramo/core'
import {
  Resolver,
  DIDDocument,
  DIDResolutionResult,
  DIDResolutionOptions,
  VerificationMethod,
  ServiceEndpoint,
  parse as parseDID,
} from 'did-resolver'
export { DIDDocument }
import Debug from 'debug'
const debug = Debug('veramo:resolver')

interface Options {
  resolver: Resolver
}

export class DIDResolverPlugin implements IAgentPlugin {
  readonly methods: IResolver
  readonly schema = schema.IResolver
  private didResolver: Resolver

  constructor(options: Options) {
    if (!options.resolver) throw Error('Missing resolver')
    this.didResolver = options.resolver

    this.methods = {
      resolveDid: this.resolveDid.bind(this),
      resolveDidFragment: this.resolveDidFragment.bind(this),
    }
  }

  /** {@inheritDoc @veramo/core#IResolver.resolveDid} */
  async resolveDid({
    didUrl,
    options,
  }: {
    didUrl: string
    options?: DIDResolutionOptions
  }): Promise<DIDResolutionResult> {
    debug('Resolving %s', didUrl)
    return this.didResolver.resolve(didUrl, options)
  }

  /** {@inheritDoc @veramo/core#IResolver.resolveDidFragment} */
  async resolveDidFragment({
    didDocument,
    didURI,
    section,
  }: {
    didDocument: DIDDocument
    didURI: string
    section?: DIDDocumentSection
  }): Promise<VerificationMethod | ServiceEndpoint> {
    debug('Resolving %s', didURI)
    const did = parseDID(didURI)?.did || didDocument.id
    const doc = didDocument
    const mainSections = [...(doc.verificationMethod || []), ...(doc.publicKey || []), ...(doc.service || [])]
    const subsection = section ? [...(doc[section] || [])] : mainSections

    let result = subsection.find((item) => {
      if (typeof item === 'string') {
        return item === didURI || `${did}#${item}` === didURI
      } else {
        return item.id === didURI || `${did}#${item.id}` === didURI
      }
    })
    if (typeof result === 'string') {
      result = mainSections.find((item) => item.id === didURI || `${did}#${item.id}` === didURI)
    }
    
    if (!result) {
      throw new Error(`not_found: DID document fragment (${didURI}) could not be located.`)
    } else if (result.id.startsWith('#')) {
      // fix did documents that use only the fragment part as key ID
      result.id = `${did}${result.id}`
    }
    return result
  }
}
