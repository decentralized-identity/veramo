import {
  CredentialPayload,
  IAgentContext,
  ICanIssueCredentialTypeArgs,
  ICreateVerifiableCredentialArgs,
  ICreateVerifiablePresentationArgs,
  IIdentifier,
  IKey,
  IResolver,
  IssuerAgentContext,
  IVerifyCredentialArgs,
  IVerifyPresentationArgs,
  IVerifyResult,
  PresentationPayload,
  VerifiableCredential,
  VerifiablePresentation,
  VerifierAgentContext,
  ICanVerifyDocumentTypeArgs,
} from '@veramo/core-types'

import {
  _ExtendedIKey, 
  extractIssuer,
  isDefined,
  MANDATORY_CREDENTIAL_CONTEXT,
  mapIdentifierKeysToDoc,
  OrPromise,
  processEntryToArray,
  RecordLike,
  removeDIDParameters,
} from '@veramo/utils'
import { AbstractCredentialProvider } from '@veramo/credential-w3c'
import { DIDResolutionOptions } from 'did-resolver'



import { BbsCredentialModule } from './bbs-credential-module.js'
import { BbsSuiteLoader } from './bbs-suite-loader.js'
import { BbsContextLoader } from './bbs-context-loader.js'
import { VeramoBbsBlsSignature } from './suites/BbsBlsSignature.js'
import { ContextDoc } from './types.js'

import { VeramoBbsSignature } from './index.js'
import Debug from 'debug'


const debug = Debug('veramo:credential-bbs:action-handler')

/**
 * A handler that implements the {@link AbstractCredentialProvider} methods.
 *
 * @public
 */
export class CredentialProviderBBS implements AbstractCredentialProvider {

  private bbsCredentialModule: BbsCredentialModule

  constructor(options: { contextMaps: RecordLike<OrPromise<ContextDoc>>[]; suites: VeramoBbsSignature[] }) {
    this.bbsCredentialModule = new BbsCredentialModule({
      bbsContextLoader: new BbsContextLoader({ contextsPaths: options.contextMaps }),
      bbsSuiteLoader: new BbsSuiteLoader({ veramoBbsSignatures: options.suites }),
    })
  }

  /** {@inheritdoc @veramo/credential-w3c#AbstractCredentialProvider.matchKeyForType} */
  matchKeyForType(key: IKey): boolean {
    return this.matchKeyForBBSSuite(key)
  }

  /** {@inheritdoc @veramo/credential-w3c#AbstractCredentialProvider.getTypeProofFormat} */
  getTypeProofFormat(): string {
    return 'bbs'
  }

  /** {@inheritdoc @veramo/credential-w3c#AbstractCredentialProvider.canIssueCredentialType} */
  canIssueCredentialType(args: ICanIssueCredentialTypeArgs): boolean {
    return (args.proofFormat === 'bbs')
  }

  /** {@inheritdoc @veramo/credential-w3c#AbstractCredentialProvider.canVerifyDocumentType */
  canVerifyDocumentType(args: ICanVerifyDocumentTypeArgs): boolean {
    const { document } = args

    for (const suite of this.bbsCredentialModule.bbsSuiteLoader.getAllSignatureSuites()) {
      if ( ((<VerifiableCredential>document)?.proof?.type || '').includes(suite.getSupportedProofType())) {
        return true
      }
    }

    return false
  }

  /** {@inheritdoc ICredentialIssuer.createVerifiablePresentationBBS} */
  async createVerifiablePresentation(
    args: ICreateVerifiablePresentationArgs,
    context: IssuerAgentContext,
  ): Promise<VerifiablePresentation> {
    const presentationContext = processEntryToArray(
      args?.presentation?.['@context'],
      MANDATORY_CREDENTIAL_CONTEXT,
    )
    const presentationType = processEntryToArray(args?.presentation?.type, 'VerifiablePresentation')

    const presentation: PresentationPayload = {
      ...args?.presentation,
      '@context': presentationContext,
      type: presentationType,
    }

    if (!isDefined(presentation.holder)) {
      throw new Error('invalid_argument: args.presentation.holder must not be empty')
    }

    if (args.presentation.verifiableCredential) {
      const credentials = args.presentation.verifiableCredential.map((cred) => {
        if (typeof cred !== 'string' && cred.proof.jwt) {
          return cred.proof.jwt
        } else {
          return cred
        }
      })
      presentation.verifiableCredential = credentials
    }

    //issuanceDate must not be present for presentations because it is not defined in a @context
    delete presentation.issuanceDate

    const holder = removeDIDParameters(presentation.holder)

    let identifier: IIdentifier
    try {
      identifier = await context.agent.didManagerGet({ did: holder })
    } catch (e) {
      throw new Error('invalid_argument: args.presentation.holder must be a DID managed by this agent')
    }
    try {
      let key: IKey | undefined;

      if (args.keyRef) {
        key = identifier.keys.find(i => i.kid === args.keyRef);
      }
      else {

        key = identifier.keys.find(i => i.type === 'Bls12381G2');
      }
      if (!key) {
        throw new Error(`The identifier does not have keys of type Bls12381G2`)
      }
      const { signingKey, verificationMethodId } = await this.findSigningKeyWithId(
        context,
        identifier,
        args.keyRef,
        args.resolutionOptions,
      )
      let { now } = args
      if (typeof now === 'number') {
        now = new Date(now * 1000)
      }
      return await this.bbsCredentialModule.signBBSVerifiablePresentation(presentation, identifier.did, signingKey, verificationMethodId, args.challenge || '', args.domain || '', { ...args, now }, context);
    } catch (error) {
      debug(error)
      return Promise.reject(error)
    }
  }

  /** {@inheritdoc ICredentialIssuer.createVerifiableCredentialBBS} */
  async createVerifiableCredential(
    args: ICreateVerifiableCredentialArgs,
    context: IssuerAgentContext,
  ): Promise<VerifiableCredential> {
    
    const credentialContext = processEntryToArray(
      args?.credential?.['@context'],
      MANDATORY_CREDENTIAL_CONTEXT,
    )
    const credentialType = processEntryToArray(args?.credential?.type, 'VerifiableCredential')
    const credential: CredentialPayload = {
      ...args?.credential,
      '@context': credentialContext,
      type: credentialType,
    }

    const issuer = extractIssuer(credential, { removeParameters: true })
    if (!issuer || typeof issuer === 'undefined') {
      throw new Error('invalid_argument: args.credential.issuer must not be empty')
    }

    let identifier: IIdentifier
    try {
      identifier = await context.agent.didManagerGet({ did: issuer })
    } catch (e) {
      throw new Error(`invalid_argument: args.credential.issuer must be a DID managed by this agent. ${e}`)
    }
    try {

      let key: IKey | undefined;
      if (args.keyRef) {
        key = identifier.keys.find(i => i.kid === args.keyRef);
      }
      else {
      key = identifier.keys.find(i => i.type === 'Bls12381G2');
      }
      if (!key) {
        throw new Error(`The identifier does not have keys of type Bls12381G2`)
      }
      const { signingKey, verificationMethodId } = await this.findSigningKeyWithId(
        context,
        identifier,
        args.keyRef,
        args.resolutionOptions,
      )

      let { now } = args
      if (typeof now === 'number') {
        now = new Date(now * 1000)
      }
      
      return await this.bbsCredentialModule.issueBBSVerifiableCredential(
        credential,
        identifier.did,
        signingKey,
        verificationMethodId,
        { ...args, now },
        context,
      )
    } catch (error) {
      debug(error)
      return Promise.reject(error)
    }
  }

  /** {@inheritdoc ICredentialIssuer.verifyCredentialBBS} */
  async verifyCredential(args: IVerifyCredentialArgs, context: VerifierAgentContext): Promise<IVerifyResult> {
    args.credential = args.credential as VerifiableCredential
    const credential = args.credential

    let now = new Date()

    if (args.policies?.now && typeof args.policies?.now === 'number') {
      now = new Date(args.policies?.now * 1000)
    }

    return this.bbsCredentialModule.verifyCredential(credential, { ...args, now }, context)
  }

  /** {@inheritdoc ICredentialVerifier.verifyPresentation} */
  async verifyPresentation(
    args: IVerifyPresentationArgs,
    context: VerifierAgentContext,
  ): Promise<IVerifyResult> {
    const presentation = args.presentation as VerifiablePresentation
    let { now } = args
    if (typeof now === 'number') {
      now = new Date(now * 1000)
    }
    return this.bbsCredentialModule.verifyPresentation(
      presentation,
      args.challenge,
      args.domain,
      { ...args, now },
      context,
    )
  }

  private async findSigningKeyWithId(
    context: IAgentContext<IResolver>,
    identifier: IIdentifier,
    keyRef?: string,
    resolutionOptions?: DIDResolutionOptions,
  ): Promise<{ signingKey: _ExtendedIKey; verificationMethodId: string }> {
    const extendedKeys: _ExtendedIKey[] = await mapIdentifierKeysToDoc(
      identifier,
      'assertionMethod',
      context,
      resolutionOptions,
    )
    let supportedTypes = this.bbsCredentialModule.bbsSuiteLoader.getAllSignatureSuiteTypes()
    let signingKey: _ExtendedIKey | undefined
    let verificationMethodId: string
    if (keyRef) {
      signingKey = extendedKeys.find((k) => k.kid === keyRef)
    }
    if (signingKey && !supportedTypes.includes(signingKey.meta.verificationMethod.type)) {
      debug(
        'WARNING: requested signing key DOES NOT correspond to a supported Signature suite type. Looking for the next best key.',
      )
      signingKey = undefined
    }
    if (!signingKey) {
      if (keyRef) {
        debug(
          'WARNING: no signing key was found that matches the reference provided. Searching for the first available signing key.',
        )
      }
      signingKey = extendedKeys.find((k) => supportedTypes.includes(k.meta.verificationMethod.type))
    }

    if (!signingKey) throw Error(`key_not_found: No suitable signing key found for ${identifier.did}`)
    verificationMethodId = signingKey.meta.verificationMethod.id
    return { signingKey, verificationMethodId }
  }

  /**
   * Returns true if the key is supported by any of the installed BBS Signature suites
   * @param k - the key to match
   *
   * @internal
   */
  matchKeyForBBSSuite(k: IKey): boolean {
    // prefilter based on key algorithms
    switch (k.type) {
      case 'Bls12381G2':
        if (!k.meta?.algorithms?.includes('BLS')) return false
        break
    }

    // TODO: this should return a list of supported suites, not just a boolean
    const suites = this.bbsCredentialModule.bbsSuiteLoader.getAllSignatureSuites()
    return suites
      .map((suite: VeramoBbsSignature) => suite.getSupportedVeramoKeyType().includes(k.type))
      .some((supportsThisKey: boolean) => supportsThisKey)
  }
}

