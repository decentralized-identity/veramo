import { DIDDocumentSection, IAgentPlugin, IResolver, schema } from '@veramo/core'
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

const didEthr = 'did:ethr:rinkeby:0x3c357ba458933a19c1df1c7f6b473b3302bbbe61'
const didKey = 'did:key:z6Mkqjn1SMUbR88S7BZFAZnr7sfzPXmm3DfRdMy3Z5CdMqnd'

/**
 * A Veramo Plugin that enables users to resolve DID documents.
 *
 * This plugin is used automatically by plugins that create or verify Verifiable Credentials or Presentations or when
 * working with DIDComm
 *
 * @public
 */
export class MockDIDResolverPlugin implements IAgentPlugin {
  readonly methods: IResolver
  readonly schema = schema.IResolver

  constructor() {

    this.methods = {
      resolveDid: this.resolveDid.bind(this),
      getDIDComponentById: this.getDIDComponentById.bind(this),
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
    if (!didUrl) throw Error('DID required')

    return {
      didDocumentMetadata: {},
      didResolutionMetadata: {},
      didDocument: {
        '@context': 'https://w3id.org/did/v1',
        id: 'did:key:z6MkoTHsgNNrby8JzCNQ1iRLyW5QQ6R8Xuu6AA8igGrMVPUM',
        publicKey: [
          {
            id: 'did:key:z6MkoTHsgNNrby8JzCNQ1iRLyW5QQ6R8Xuu6AA8igGrMVPUM#z6MkoTHsgNNrby8JzCNQ1iRLyW5QQ6R8Xuu6AA8igGrMVPUM',
            type: 'Ed25519VerificationKey2018',
            controller: 'did:key:z6MkoTHsgNNrby8JzCNQ1iRLyW5QQ6R8Xuu6AA8igGrMVPUM',
            publicKeyBase58: 'A12q688RGRdqshXhL9TW8QXQaX9H82ejU9DnqztLaAgy',
          },
        ],
      },
    }
  }

  /** {@inheritDoc @veramo/core#IResolver.getDIDComponentById} */
  async getDIDComponentById({
    didDocument,
    didUrl,
    section,
  }: {
    didDocument: DIDDocument
    didUrl: string
    section?: DIDDocumentSection
  }): Promise<VerificationMethod | ServiceEndpoint> {
    return {}
  }
}
