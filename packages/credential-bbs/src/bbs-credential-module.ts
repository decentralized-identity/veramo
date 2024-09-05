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
import fetch from 'cross-fetch'
import Debug from 'debug'
import * as vc from '@digitalcredentials/vc'

import pkg from 'jsonld-signatures';
const { extendContextLoader, sign, purposes, verify } = pkg;
import { deriveProof } from '@mattrglobal/jsonld-signatures-bbs';

import { BbsContextLoader } from './bbs-context-loader.js'
import { BbsSuiteLoader } from './bbs-suite-loader.js'
import { RequiredAgentMethods } from './bbs-suites.js'
import { ICreateBbsSelectiveDisclosureCredentialArgs, IVerifyBbsDerivedProofCredentialArgs } from './types.js';



const debug = Debug('veramo:w3c:bbs-credential-module')

type ForwardedOptions = UsingResolutionOptions & {
  fetchRemoteContexts?: boolean // defaults to false
  now?: Date // defaults to Date.now()
}

export class BbsCredentialModule {

  private bbsContextLoader: BbsContextLoader
  bbsSuiteLoader: BbsSuiteLoader

  constructor(options: { bbsContextLoader: BbsContextLoader; bbsSuiteLoader: BbsSuiteLoader }) {
    this.bbsContextLoader = options.bbsContextLoader
    this.bbsSuiteLoader = options.bbsSuiteLoader
  }

  addContext(key: string, value: any) {
    this.bbsContextLoader.set(key, value);
  }

  getDocumentLoader(context: IAgentContext<IResolver>, options?: ForwardedOptions) {
    return extendContextLoader(async (url: string) => {

      const resolutionOptions = { accept: 'application/did+ld+json', ...options?.resolutionOptions }
      const attemptToFetchContexts = options?.fetchRemoteContexts ?? false

      // did resolution
      if (url.toLowerCase().startsWith('did:')) {
        let didDoc: any;
        const resolutionResult = await context.agent.resolveDid({ didUrl: url, options: resolutionOptions })
        didDoc = resolutionResult.didDocument
        if (!didDoc) return

        let result: any = didDoc

        for (const x of this.bbsSuiteLoader.getAllSignatureSuites()) {
          result = (await x.preDidResolutionModification(url, result, context)) || result
        }

        return {
          contextUrl: null,
          documentUrl: url,
          document: result,
        }
      }

      if (this.bbsContextLoader.has(url)) {
        const contextDoc = await this.bbsContextLoader.get(url)
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

  async issueBBSVerifiableCredential(
    credential: CredentialPayload,
    issuerDid: string,
    key: IKey,
    verificationMethodId: string,
    options: ForwardedOptions,
    context: IAgentContext<RequiredAgentMethods>,
  ): Promise<VerifiableCredential> {

    let fullKey = await context.agent.keyManagerGetKey(key);
    key.privateKeyHex = fullKey.privateKeyHex;

    const suite = this.bbsSuiteLoader.getAllSignatureSuites().map((x) => x.getSuiteForSigning(key, issuerDid, verificationMethodId, context))[0];
    const documentLoader = this.getDocumentLoader(context, options)

    const signedDocument = await sign(credential, {
      suite: suite,
      purpose: new purposes.AssertionProofPurpose(),
      documentLoader, compactProof: undefined, expansionMap: undefined
    });
    return signedDocument as VerifiableCredential
  }

  async signBBSVerifiablePresentation(
    presentation: PresentationPayload,
    holderDid: string,
    key: IKey,
    verificationMethodId: string,
    challenge: string | undefined,
    domain: string | undefined,
    options: ForwardedOptions,
    context: IAgentContext<RequiredAgentMethods>,
  ): Promise<VerifiablePresentation> {

    let fullKey = await context.agent.keyManagerGetKey(key);
    key.privateKeyHex = fullKey.privateKeyHex;


    const suite = this.bbsSuiteLoader.getAllSignatureSuites().map((x) => x.getSuiteForSigning(key, holderDid, verificationMethodId, context))[0];
    const documentLoader = this.getDocumentLoader(context, options)

    let purpose = new purposes.AssertionProofPurpose();
    if (presentation.verifier?.length == 0) {
      delete presentation.verifier;
    }
    const signedPresentation = await sign(presentation, {
      suite: suite,
      purpose: purpose,
      documentLoader, compactProof: false, expansionMap: undefined

    });
    return signedPresentation as VerifiablePresentation
  }

  async signSelectiveDisclosureCredential(
    args: ICreateBbsSelectiveDisclosureCredentialArgs,
    options: ForwardedOptions,
    context: IAgentContext<RequiredAgentMethods>,
  ): Promise<VerifiableCredential> {

    try {
      //Derive a proof
      const suite = this.bbsSuiteLoader.getAllSignatureSuites().map((x) => x.getSuiteForProof2020Verification())[0];
      const documentLoader = this.getDocumentLoader(context, options)
      const derivedProof = await deriveProof(args.proofDocument, args.revealDocument, {
        suite: suite,
        documentLoader,
      });
      return derivedProof as VerifiableCredential
    } catch (error) {
      debug(error)
      return Promise.reject(error)
    }
  }

  async verifyCredential(
    credential: VerifiableCredential,
    options: ForwardedOptions,
    context: IAgentContext<IResolver>,
  ): Promise<IVerifyResult> {
    let errorCode, message
    let verified: IVerifyResult;
    try {
      const suite = this.bbsSuiteLoader.getAllSignatureSuites().map((x) => x.getSuiteForVerification())[0];
      const documentLoader = this.getDocumentLoader(context, options)
      verified = await verify(credential, {
        suite: suite,
        purpose: new purposes.AssertionProofPurpose(),
        documentLoader, compactProof: undefined, expansionMap: undefined
      });
    } catch (error: any) {

      errorCode = error.errorCode
      message = error.message

      debug(`Error verifying BBS Credential: ${JSON.stringify(error, null, 2)}`)
      return {
        verified: false,
        error: {
          message,
          errorCode: errorCode ? errorCode : message?.split(':')[0],
        },
      }
    }

    return verified

  }

  async verifyPresentation(
    presentation: VerifiablePresentation,
    challenge: string | undefined,
    domain: string | undefined,
    options: ForwardedOptions,
    context: IAgentContext<IResolver>,
  ): Promise<IVerifyResult> {
    let errorCode, message
    let verified: IVerifyResult;
    try {
      const suite = this.bbsSuiteLoader.getAllSignatureSuites().map((x) => x.getSuiteForVerification())[0];
      const documentLoader = this.getDocumentLoader(context, options)
      let purpose = new purposes.AssertionProofPurpose();

      verified = await verify(presentation, {
        suite: suite,
        purpose: purpose,
        documentLoader, compactProof: false, expansionMap: undefined
      });
    } catch (error: any) {
      errorCode = error.errorCode
      message = error.message
      debug(`Error verifying BBS Presentation: ${JSON.stringify(error, null, 2)}`)
      return {
        verified: false,
        error: {
          message,
          errorCode: errorCode ? errorCode : message?.split(':')[0],
        },
      }
    }

    return verified
  }

  async verifyDerivedProofBbs(
    args: IVerifyBbsDerivedProofCredentialArgs,
    options: ForwardedOptions,
    context: IAgentContext<RequiredAgentMethods>,
  ): Promise<boolean> {
    const credential = args.credential
    const suite = this.bbsSuiteLoader.getAllSignatureSuites().map((x) => x.getSuiteForProof2020Verification())[0];
    const documentLoader = this.getDocumentLoader(context, options)
    let verified = await verify(credential, {
      suite: suite,
      purpose: args.purpose,
      documentLoader, compactProof: undefined, expansionMap: undefined
    });

    return verified as boolean
  }
}