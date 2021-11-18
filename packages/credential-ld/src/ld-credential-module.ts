import {
  IAgentContext,
  IIdentifier,
  IKey,
  IResolver,
  VerifiableCredential,
  VerifiablePresentation,
} from '@veramo/core'
import Debug from 'debug'
import { CredentialPayload, PresentationPayload } from 'did-jwt-vc'
import { extendContextLoader, purposes } from 'jsonld-signatures'
import * as vc from 'vc-js'
import { LdContextLoader } from './ld-context-loader'
import { LdSuiteLoader } from './ld-suite-loader'
import { RequiredAgentMethods } from './ld-suites'

const AssertionProofPurpose = purposes.AssertionProofPurpose

const debug = Debug('veramo:w3c:ld-credential-module')

export class LdCredentialModule {
  /**
   * TODO: General Implementation Notes
   * - (SOLVED) EcdsaSecp256k1Signature2019 (Signature) and EcdsaSecp256k1VerificationKey2019 (Key)
   * are not useable right now, since they are not able to work with blockChainId and ECRecover.
   * - DID Fragment Resolution.
   * - Key Manager and Verification Methods: Veramo currently implements no link between those.
   */

  private ldContextLoader: LdContextLoader
  private ldSuiteLoader: LdSuiteLoader
  constructor(options: { ldContextLoader: LdContextLoader; ldSuiteLoader: LdSuiteLoader }) {
    this.ldContextLoader = options.ldContextLoader
    this.ldSuiteLoader = options.ldSuiteLoader
  }

  getDocumentLoader(context: IAgentContext<IResolver>) {
    return extendContextLoader(async (url: string) => {
      // console.log(`resolving context for: ${url}`)

      // did resolution
      if (url.toLowerCase().startsWith('did:')) {
        const didDoc = await context.agent.resolveDid({ didUrl: url })
        const returnDocument = didDoc.didDocument

        if (!returnDocument) return

        // currently Veramo LD suites can modify the resolution response for DIDs from
        // the document Loader. This allows to fix incompatibilities between DID Documents
        // and LD suites to be fixed specifically within the Veramo LD Suites definition
        this.ldSuiteLoader
          .getAllSignatureSuites()
          .forEach((x) => x.preDidResolutionModification(url, returnDocument))

        // console.log(`Returning from Documentloader: ${JSON.stringify(returnDocument)}`)
        return {
          contextUrl: null,
          documentUrl: url,
          document: returnDocument,
        }
      }

      if (this.ldContextLoader.has(url)) {
        const contextDoc = await this.ldContextLoader.get(url)
        return {
          contextUrl: null,
          documentUrl: url,
          document: contextDoc,
        }
      }

      debug('WARNING: Possible unknown context/identifier for', url)
      console.log(`WARNING: Possible unknown context/identifier for: ${url}`)

      return vc.defaultDocumentLoader(url)
    })
  }

  async issueLDVerifiableCredential(
    credential: Partial<CredentialPayload>,
    key: IKey,
    identifier: IIdentifier,
    context: IAgentContext<RequiredAgentMethods>,
  ): Promise<VerifiableCredential> {
    const suite = this.ldSuiteLoader.getSignatureSuiteForKeyType(key.type)
    const documentLoader = this.getDocumentLoader(context)

    // some suites can modify the incoming credential (e.g. add required contexts)W
    suite.preSigningCredModification(credential)

    return await vc.issue({
      credential,
      suite: suite.getSuiteForSigning(key, identifier, context),
      documentLoader,
      compactProof: false,
    })
  }

  async signLDVerifiablePresentation(
    presentation: Partial<PresentationPayload>,
    key: IKey,
    challenge: string | undefined,
    domain: string | undefined,
    identifier: IIdentifier,
    context: IAgentContext<RequiredAgentMethods>,
  ): Promise<VerifiablePresentation> {
    const suite = this.ldSuiteLoader.getSignatureSuiteForKeyType(key.type)
    const documentLoader = this.getDocumentLoader(context)

    suite.preSigningPresModification(presentation)

    return await vc.signPresentation({
      presentation,
      suite: suite.getSuiteForSigning(key, identifier, context),
      challenge,
      domain,
      documentLoader,
      purpose: new AssertionProofPurpose(),
      compactProof: false,
    })
  }

  async verifyCredential(
    credential: Partial<CredentialPayload>,
    context: IAgentContext<IResolver>,
  ): Promise<boolean> {
    const result = await vc.verifyCredential({
      credential,
      suite: this.ldSuiteLoader.getAllSignatureSuites().map((x) => x.getSuiteForVerification()),
      documentLoader: this.getDocumentLoader(context),
      purpose: new AssertionProofPurpose(),
      compactProof: false,
    })

    if (result.verified) return true

    // NOT verified.

    // result can include raw Error
    console.log(`Error verifying LD Verifiable Credential`)
    // console.log(JSON.stringify(result, null, 2));
    throw Error('Error verifying LD Verifiable Credential')
  }

  async verifyPresentation(
    presentation: Partial<PresentationPayload>,
    challenge: string | undefined,
    domain: string | undefined,
    context: IAgentContext<IResolver>,
  ): Promise<boolean> {
    const result = await vc.verify({
      presentation,
      suite: this.ldSuiteLoader.getAllSignatureSuites().map((x) => x.getSuiteForVerification()),
      documentLoader: this.getDocumentLoader(context),
      challenge,
      domain,
      purpose: new AssertionProofPurpose(),
      compactProof: false,
    })

    if (result.verified) return true

    // NOT verified.

    // result can include raw Error
    console.log(`Error verifying LD Verifiable Presentation`)
    console.log(JSON.stringify(result, null, 2))
    throw Error('Error verifying LD Verifiable Presentation')
  }
}
