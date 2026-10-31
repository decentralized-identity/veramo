import {
  CredentialPayload,
  IAgentContext,
  IKey,
  IResolver,
  IVerifyResult,
  PresentationPayload,
  UsingResolutionOptions,
  VerifiableCredential,
  VerifiablePresentation,
} from '@veramo/core-types'
import Debug from 'debug'
import jsonldSignatures from 'jsonld-signatures'
import { issue, signPresentation, verifyCredential, verifyPresentation } from './vc.js'

const { extendContextLoader } = jsonldSignatures
import { LdContextLoader } from './ld-context-loader.js'
import { LdCredentialsContexts } from './ld-default-contexts.js'
import { LdSuiteLoader } from './ld-suite-loader.js'
import { RequiredAgentMethods } from './ld-suites.js'

const debug = Debug('veramo:w3c:ld-credential-module')

type ForwardedOptions = UsingResolutionOptions & {
  fetchRemoteContexts?: boolean // defaults to false
  now?: Date // defaults to Date.now()
}

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

  getDocumentLoader(context: IAgentContext<IResolver>, options?: ForwardedOptions) {
    return extendContextLoader(async (url: string) => {
      const resolutionOptions = { accept: 'application/did+ld+json', ...options?.resolutionOptions }
      const attemptToFetchContexts = options?.fetchRemoteContexts ?? false

      // did resolution
      if (url.toLowerCase().startsWith('did:')) {
        const resolutionResult = await context.agent.resolveDid({ didUrl: url, options: resolutionOptions })
        const didDoc = resolutionResult.didDocument

        if (!didDoc) {
          const reason = resolutionResult.didResolutionMetadata?.error ?? 'notFound'
          throw new Error(`not_found: unable to resolve ${url} (${reason})`)
        }

        let result: any = didDoc

        // currently, Veramo LD suites can modify the resolution response for DIDs from
        // the document Loader. This allows us to fix incompatibilities between DID Documents
        // and LD suites to be fixed specifically within the Veramo LD Suites definition
        // TODO: every suite takes turns modifying the result, potentially leading to overwrites and incompatibilities
        // between concurrent suites. Ideally, this should be performed by each suite only before it interacts with the
        // document loader, to allow each suite to massage the verification methods into formats it knows about.
        for (const x of this.ldSuiteLoader.getAllSignatureSuites()) {
          result = (await x.preDidResolutionModification(url, result, context)) || result
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
            const response = await globalThis.fetch(url)
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

      if (LdCredentialsContexts.has(url)) {
        return { contextUrl: null, documentUrl: url, document: LdCredentialsContexts.get(url) }
      }
      throw new Error(`Document loader unable to load URL "${url}".`)
    })
  }

  async issueLDVerifiableCredential(
    credential: CredentialPayload,
    issuerDid: string,
    key: IKey,
    verificationMethodId: string,
    options: ForwardedOptions,
    context: IAgentContext<RequiredAgentMethods>,
  ): Promise<VerifiableCredential> {
    // TODO: try multiple matching suites until one works or list is exhausted
    const suite = this.ldSuiteLoader.getSignatureSuiteForKeyType(
      key.type,
      key.meta?.verificationMethod?.type ?? '',
    )[0]
    const documentLoader = this.getDocumentLoader(context, options)

    // some suites can modify the incoming credential (e.g. add required contexts)
    suite.preSigningCredModification(credential)

    return await issue(credential, {
      ...options,
      suite: await suite.getSuiteForSigning(key, issuerDid, verificationMethodId, context),
      documentLoader,
    })
  }

  async signLDVerifiablePresentation(
    presentation: PresentationPayload,
    holderDid: string,
    key: IKey,
    verificationMethodId: string,
    challenge: string | undefined,
    domain: string | undefined,
    options: ForwardedOptions,
    context: IAgentContext<RequiredAgentMethods>,
  ): Promise<VerifiablePresentation> {
    // TODO: try multiple matching suites until one works or list is exhausted
    const suite = this.ldSuiteLoader.getSignatureSuiteForKeyType(
      key.type,
      key.meta?.verificationMethod?.type ?? '',
    )[0]
    const documentLoader = this.getDocumentLoader(context, options)

    suite.preSigningPresModification(presentation)

    return await signPresentation(presentation, {
      ...options,
      suite: await suite.getSuiteForSigning(key, holderDid, verificationMethodId, context),
      challenge,
      domain,
      documentLoader,
    })
  }

  async verifyCredential(
    credential: VerifiableCredential,
    options: ForwardedOptions,
    context: IAgentContext<IResolver>,
  ): Promise<IVerifyResult> {
    const fetchRemoteContexts = options.fetchRemoteContexts ?? false
    // credential status is checked by @veramo/credential-w3c, not here
    const result = await verifyCredential(credential, {
      ...options,
      suite: this.ldSuiteLoader.getAllSignatureSuites().map((x) => x.getSuiteForVerification()),
      documentLoader: this.getDocumentLoader(context, { ...options, fetchRemoteContexts }),
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
    options: ForwardedOptions,
    context: IAgentContext<IResolver>,
  ): Promise<IVerifyResult> {
    const fetchRemoteContexts = options.fetchRemoteContexts ?? false
    const result = await verifyPresentation(presentation, {
      ...options,
      suite: this.ldSuiteLoader.getAllSignatureSuites().map((x) => x.getSuiteForVerification()),
      documentLoader: this.getDocumentLoader(context, { ...options, fetchRemoteContexts }),
      challenge,
      domain,
    })

    if (!result.verified) {
      // result can include raw Error
      debug(`Error verifying LD Presentation: ${JSON.stringify(result, null, 2)}`)
    }
    return result
  }
}
