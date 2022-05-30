import {
  CredentialPayload,
  IAgentContext,
  IKey,
  IResolver,
  PresentationPayload,
  VerifiableCredential,
  VerifiablePresentation,
} from '@veramo/core'
import fetch from 'cross-fetch'
import Debug from 'debug'
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
  ldSuiteLoader: LdSuiteLoader
  constructor(options: { ldContextLoader: LdContextLoader; ldSuiteLoader: LdSuiteLoader }) {
    this.ldContextLoader = options.ldContextLoader
    this.ldSuiteLoader = options.ldSuiteLoader
  }

  getDocumentLoader(context: IAgentContext<IResolver>, attemptToFetchContexts: boolean = false) {
    return extendContextLoader(async (url: string) => {
      // console.log(`resolving context for: ${url}`)

      // did resolution
      if (url.toLowerCase().startsWith('did:')) {
        const resolutionResult = await context.agent.resolveDid({ didUrl: url })
        const didDoc = resolutionResult.didDocument

        if (!didDoc) return

        // currently Veramo LD suites can modify the resolution response for DIDs from
        // the document Loader. This allows to fix incompatibilities between DID Documents
        // and LD suites to be fixed specifically within the Veramo LD Suites definition
        this.ldSuiteLoader.getAllSignatureSuites().forEach((x) => x.preDidResolutionModification(url, didDoc))

        // console.log(`Returning from Documentloader: ${JSON.stringify(returnDocument)}`)
        return {
          contextUrl: null,
          documentUrl: url,
          document: didDoc,
        }
      }

      if (this.ldContextLoader.has(url)) {
        const contextDoc = await this.ldContextLoader.get(url)
        return {
          contextUrl: null,
          documentUrl: url,
          document: contextDoc,
        }
      } else {
        if (attemptToFetchContexts) {
          // attempt to fetch the remote context!!!! MEGA FAIL for JSON-LD.
          debug('WARNING: attempting to fetch the doc directly for ', url)
          try {
            const response = await fetch(url)
            if (response.status === 200) {
              const document = await response.json()
              return {
                contextUrl: null,
                documentUrl: url,
                document,
              }
            }
          } catch (e) {
            debug('WARNING: unable to fetch the doc or interpret it as JSON', e)
          }
        }
      }

      debug(
        `WARNING: Possible unknown context/identifier for ${url} \n falling back to default documentLoader`,
      )

      return vc.defaultDocumentLoader(url)
    })
  }

  async issueLDVerifiableCredential(
    credential: CredentialPayload,
    issuerDid: string,
    key: IKey,
    verificationMethodId: string,
    context: IAgentContext<RequiredAgentMethods>,
  ): Promise<VerifiableCredential> {
    const suite = this.ldSuiteLoader.getSignatureSuiteForKeyType(key.type)
    const documentLoader = this.getDocumentLoader(context)

    // some suites can modify the incoming credential (e.g. add required contexts)W
    suite.preSigningCredModification(credential)

    return await vc.issue({
      credential,
      suite: suite.getSuiteForSigning(key, issuerDid, verificationMethodId, context),
      documentLoader,
      compactProof: false,
    })
  }

  async signLDVerifiablePresentation(
    presentation: PresentationPayload,
    holderDid: string,
    key: IKey,
    verificationMethodId: string,
    challenge: string | undefined,
    domain: string | undefined,
    context: IAgentContext<RequiredAgentMethods>,
  ): Promise<VerifiablePresentation> {
    const suite = this.ldSuiteLoader.getSignatureSuiteForKeyType(key.type)
    const documentLoader = this.getDocumentLoader(context)

    suite.preSigningPresModification(presentation)

    return await vc.signPresentation({
      presentation,
      suite: suite.getSuiteForSigning(key, holderDid, verificationMethodId, context),
      challenge,
      domain,
      documentLoader,
      purpose: new AssertionProofPurpose(),
      compactProof: false,
    })
  }

  async verifyCredential(
    credential: VerifiableCredential,
    fetchRemoteContexts: boolean = false,
    context: IAgentContext<IResolver>,
  ): Promise<boolean> {
    const checkStatusFn =
      typeof context.agent.checkCredentialStatus === 'function'
        ? async ({ credential }: any) => {
            const result = await context.agent.checkCredentialStatus({
              credential,
            })
            return { verified: !result.revoked }
          }
        : void 0

    const result = await vc.verifyCredential({
      credential,
      suite: this.ldSuiteLoader.getAllSignatureSuites().map((x) => x.getSuiteForVerification()),
      documentLoader: this.getDocumentLoader(context, fetchRemoteContexts),
      purpose: new AssertionProofPurpose(),
      compactProof: false,
      checkStatus: checkStatusFn,
    })

    if (result.verified) return true

    // NOT verified.

    // result can include raw Error
    debug(`Error verifying LD Verifiable Credential: ${JSON.stringify(result, null, 2)}`)
    // console.log(JSON.stringify(result, null, 2));
    throw Error('Error verifying LD Verifiable Credential')
  }

  async verifyPresentation(
    presentation: VerifiablePresentation,
    challenge: string | undefined,
    domain: string | undefined,
    fetchRemoteContexts: boolean = false,
    context: IAgentContext<IResolver>,
  ): Promise<boolean> {
    const result = await vc.verify({
      presentation,
      suite: this.ldSuiteLoader.getAllSignatureSuites().map((x) => x.getSuiteForVerification()),
      documentLoader: this.getDocumentLoader(context, fetchRemoteContexts),
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
