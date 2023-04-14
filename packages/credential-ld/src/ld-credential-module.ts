import {
  CredentialPayload,
  IAgentContext,
  IKey,
  IResolver,
  PresentationPayload,
  VerifiableCredential,
  VerifiablePresentation,
} from '@veramo/core-types'
import fetch from 'cross-fetch'
import Debug from 'debug'
import jsonldSignatures from '@digitalcredentials/jsonld-signatures'

const { extendContextLoader } = jsonldSignatures
import * as vc from '@digitalcredentials/vc'
import { LdContextLoader } from './ld-context-loader.js'
import { LdSuiteLoader } from './ld-suite-loader.js'
import { RequiredAgentMethods } from './ld-suites.js'

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

  getDocumentLoader(
    context: IAgentContext<IResolver>,
    attemptToFetchContexts: boolean = false,
  ) {
    return extendContextLoader(async (url: string) => {
      // console.log(`resolving context for: ${url}`)

      // did resolution
      if (url.toLowerCase().startsWith('did:')) {
        const resolutionResult = await context.agent.resolveDid({ didUrl: url })
        const didDoc = resolutionResult.didDocument

        if (!didDoc) return

        let result: any = didDoc

        // currently, Veramo LD suites can modify the resolution response for DIDs from
        // the document Loader. This allows us to fix incompatibilities between DID Documents
        // and LD suites to be fixed specifically within the Veramo LD Suites definition
        for (const x of this.ldSuiteLoader.getAllSignatureSuites()) {
          result = (await x.preDidResolutionModification(url, result, context)) || result;
        }

        // console.log(`Returning from Documentloader: ${JSON.stringify(returnDocument)}`)
        return {
          contextUrl: null,
          documentUrl: url,
          document: result,
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
    options: any,
    context: IAgentContext<RequiredAgentMethods>,
  ): Promise<VerifiableCredential> {
    const suite = this.ldSuiteLoader.getSignatureSuiteForKeyType(
      key.type,
      key.meta?.verificationMethod?.type ?? '',
    )
    const documentLoader = this.getDocumentLoader(context, options.fetchRemoteContexts)

    // some suites can modify the incoming credential (e.g. add required contexts)
    suite.preSigningCredModification(credential)

    return await vc.issue({
      ...options,
      credential,
      suite: await suite.getSuiteForSigning(key, issuerDid, verificationMethodId, context),
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
    options: any,
    context: IAgentContext<RequiredAgentMethods>,
  ): Promise<VerifiablePresentation> {
    const suite = this.ldSuiteLoader.getSignatureSuiteForKeyType(
      key.type,
      key.meta?.verificationMethod?.type ?? '',
    )
    const documentLoader = this.getDocumentLoader(context, options.fetchRemoteContexts)

    suite.preSigningPresModification(presentation)

    return await vc.signPresentation({
      ...options,
      presentation,
      suite: await suite.getSuiteForSigning(key, holderDid, verificationMethodId, context),
      challenge,
      domain,
      documentLoader,
      compactProof: false,
    })
  }

  async verifyCredential(
    credential: VerifiableCredential,
    fetchRemoteContexts: boolean = false,
    options: any,
    context: IAgentContext<IResolver>,
  ): Promise<boolean> {
    const result = await vc.verifyCredential({
      ...options,
      credential,
      suite: this.ldSuiteLoader.getAllSignatureSuites().map((x) => x.getSuiteForVerification()),
      documentLoader: this.getDocumentLoader(context, fetchRemoteContexts),
      compactProof: false,
      checkStatus: async () => Promise.resolve({ verified: true }), // Fake method
    })

    if (!result.verified) {
      // result can include raw Error
      debug(`Error verifying LD Credential: ${JSON.stringify(result, null, 2)}`)
    }

    return result
  }

  async verifyPresentation(
    presentation: VerifiablePresentation,
    challenge: string | undefined,
    domain: string | undefined,
    fetchRemoteContexts: boolean = false,
    options: any,
    context: IAgentContext<IResolver>,
  ): Promise<boolean> {
    const result = await vc.verify({
      ...options,
      presentation,
      suite: this.ldSuiteLoader.getAllSignatureSuites().map((x) => x.getSuiteForVerification()),
      documentLoader: this.getDocumentLoader(context, fetchRemoteContexts),
      challenge,
      domain,
      compactProof: false,
    })

    if (!result.verified) {
      // result can include raw Error
      debug(`Error verifying LD Presentation: ${JSON.stringify(result, null, 2)}`)
    }
    return result
  }
}
