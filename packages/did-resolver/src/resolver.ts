import { DIDDocumentSection, IAgentPlugin, IResolver } from '@veramo/core-types'
import { schema } from '@veramo/core-types'
import { isDefined } from '@veramo/utils'
import {
  DIDDocument,
  DIDResolutionOptions,
  DIDResolutionResult,
  DIDResolver,
  parse as parseDID,
  Resolvable,
  Resolver,
  ServiceEndpoint,
  VerificationMethod,
} from 'did-resolver'
import Debug from 'debug'

const debug = Debug('veramo:resolver')

/**
 * A Veramo Plugin that enables users to resolve DID documents.
 *
 * This plugin is used automatically by plugins that create or verify Verifiable Credentials or Presentations or when
 * working with DIDComm
 *
 * @public
 */
export class DIDResolverPlugin implements IAgentPlugin {
  readonly methods: IResolver
  readonly schema = schema.IResolver
  private didResolver: Resolvable

  constructor(options: { resolver?: Resolvable } | { [didMethod: string]: DIDResolver }) {
    const { resolver, ...resolverMap } = options
    if (isDefined(resolver)) {
      this.didResolver = resolver as Resolvable
    } else if (Object.keys(resolverMap).length > 0) {
      this.didResolver = new Resolver(resolverMap as Record<string, DIDResolver>)
    } else {
      throw Error(
        'invalid_setup: The DIDResolverPlugin must be initialized with a Resolvable or a map of methods to DIDResolver implementations',
      )
    }

    this.methods = {
      resolveDid: this.resolveDid.bind(this),
      getDIDComponentById: this.getDIDComponentById.bind(this),
    }
  }

  /** {@inheritDoc @veramo/core-types#IResolver.resolveDid} */
  async resolveDid({
    didUrl,
    options,
  }: {
    didUrl: string
    options?: DIDResolutionOptions
  }): Promise<DIDResolutionResult> {
    debug('Resolving %s', didUrl)
    const resolverOptions = {
      accept: 'application/did+ld+json',
      ...options,
    }

    // ensure the required fields are present, even if the resolver is not compliant
    const cannedResponse: DIDResolutionResult = {
      didDocumentMetadata: {},
      didResolutionMetadata: {},
      didDocument: null,
    }

    const resolution = await this.didResolver.resolve(didUrl, resolverOptions)

    return {
      ...cannedResponse,
      ...resolution,
    }
  }

  /** {@inheritDoc @veramo/core-types#IResolver.getDIDComponentById} */
  async getDIDComponentById({
    didDocument,
    didUrl,
    section,
  }: {
    didDocument: DIDDocument
    didUrl: string
    section?: DIDDocumentSection
  }): Promise<VerificationMethod | ServiceEndpoint> {
    debug('Resolving %s', didUrl)
    const did = parseDID(didUrl)?.did || didDocument.id
    const doc = didDocument
    const mainSections = [...(doc.verificationMethod || []), ...(doc.publicKey || []), ...(doc.service || [])]
    const subsection = section ? [...(doc[section] || [])] : mainSections

    let result = subsection.find((item) => {
      if (typeof item === 'string') {
        return item === didUrl || `${did}${item}` === didUrl
      } else {
        return item.id === didUrl || `${did}${item.id}` === didUrl
      }
    })
    if (typeof result === 'string') {
      result = mainSections.find((item) => item.id === didUrl || `${did}${item.id}` === didUrl || item.id === `${did}${didUrl}`);
    }

    if (!result) {
      const err = `not_found: DID document fragment (${didUrl}) could not be located.`
      debug(err)
      throw new Error(err)
    } else if (result.id.startsWith('#')) {
      // fix did documents that use only the fragment part as key ID
      result.id = `${did}${result.id}`
    }
    return result
  }
}
