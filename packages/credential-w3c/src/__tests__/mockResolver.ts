import { DIDDocumentSection, IAgentPlugin, IResolver } from '@veramo/core'
import schema from "@veramo/core/build/plugin.schema.json" assert { type: 'json' }
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

    if (didUrl === didEthr) {
        return Promise<DIDResolutionResult>.resolve({
        didResolutionMetadata: {},
        didDocumentMetadata: {},
        didDocument: {
            '@context': 'https://w3id.org/did/v1',
            id: didUrl,
            verificationMethod: [
            {
                id: `${didEthr}#owner`,
                type: 'EcdsaSecp256k1RecoveryMethod2020',
                controller: didUrl,
                blockchainAccountId: `eip155:1:${didEthr.slice(-42)}`,
            },
            ],
            authentication: [`${didEthr}#owner`],
        },
        })
    } else {
        return Promise<DIDResolutionResult>.resolve({
        didResolutionMetadata: {},
        didDocumentMetadata: {},
        didDocument: {
            '@context': 'https://www.w3.org/ns/did/v1',
            id: didKey,
            verificationMethod: [
            {
                id: '#z6Mkqjn1SMUbR88S7BZFAZnr7sfzPXmm3DfRdMy3Z5CdMqnd',
                type: 'Ed25519VerificationKey2018',
                controller: didKey,
                publicKeyBase58: 'CHWxr7EA5adxzgiYUzq1Gn7zZxVudLR4wM47ioEcSd1F',
            },
            {
                id: '#z6LSkpCZ3cLP76M3Q26rhZe6q98vMdcSPTt4iML4r9UT7LVt',
                type: 'X25519KeyAgreementKey2019',
                controller: didKey,
                publicKeyBase58: 'A92PXJXX1ddJJdj6Av89WYvSWV5KgrhuqNcPMgpvPxj8',
            },
            ],
            authentication: ['#z6Mkqjn1SMUbR88S7BZFAZnr7sfzPXmm3DfRdMy3Z5CdMqnd'],
            assertionMethod: ['#z6Mkqjn1SMUbR88S7BZFAZnr7sfzPXmm3DfRdMy3Z5CdMqnd'],
        },
        })
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
