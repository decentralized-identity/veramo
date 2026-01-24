import {
  CredentialPayload,
  IAgentContext,
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
  PROOF_FORMAT,
  ProofFormat,
  VerifiableCredential,
  VerifiablePresentation,
  VerifierAgentContext,
} from '@veramo/core-types'
import { VeramoLdSignature } from './index.js'
import Debug from 'debug'
import { LdContextLoader } from './ld-context-loader.js'
import {
  _ExtendedIKey,
  extractIssuer,
  intersect,
  isDefined,
  MANDATORY_CREDENTIAL_CONTEXT,
  mapIdentifierKeysToDoc,
  OrPromise,
  processEntryToArray,
  RecordLike,
  removeDIDParameters,
} from '@veramo/utils'

import { LdCredentialModule } from './ld-credential-module.js'
import { LdSuiteLoader } from './ld-suite-loader.js'
import { ContextDoc } from './types.js'
import { DIDResolutionOptions } from 'did-resolver'

import { ICredentialProvider, ProofFormatQuery, TentativeVerificationQuery } from '@veramo/credential-w3c'

const debug = Debug('veramo:credential-ld:action-handler')

/**
 * A Veramo Credential sub-plugin that implements
 * a {@link @veramo/credential-w3c#ICredentialProvider | ICredentialProvider} with support for
 * Verifiable Credentials and Presentations using JSON-LD proofs.
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 * @see {@link https://www.w3.org/TR/vc-data-model-1.1/ | VC 1.1 data model}.
 */
export class CredentialProviderLD implements ICredentialProvider {
  private ldCredentialModule: LdCredentialModule

  constructor(options: { contextMaps: RecordLike<OrPromise<ContextDoc>>[]; suites: VeramoLdSignature[] }) {
    this.ldCredentialModule = new LdCredentialModule({
      ldContextLoader: new LdContextLoader({ contextsPaths: options.contextMaps }),
      ldSuiteLoader: new LdSuiteLoader({ veramoLdSignatures: options.suites }),
    })
  }

  /** {@inheritdoc @veramo/credential-w3c#ICredentialProvider.getProofFormatsSupportedForKey} */
  getProofFormatsSupportedForKey(key: IKey): ProofFormat[] {
    if (this.matchKeyForLDSuite(key)) {
      return [PROOF_FORMAT.LD_SIGNATURE]
    }
    return []
  }

  /** {@inheritdoc @veramo/credential-w3c#ICredentialProvider.canIssueCredentialType} */
  canIssueProofFormat(query: ProofFormatQuery): boolean {
    return query.proofFormat === PROOF_FORMAT.LD_SIGNATURE
  }

  /** {@inheritdoc @veramo/credential-w3c#ICredentialProvider.canVerifyDocumentType} */
  canVerifyDocumentType(query: TentativeVerificationQuery): boolean {
    const { document } = query

    for (const suite of this.ldCredentialModule.ldSuiteLoader.getAllSignatureSuites()) {
      if (suite.getSupportedProofType() === (<VerifiableCredential>document)?.proof?.type || '') {
        return true
      }
    }

    return false
  }

  /** {@inheritdoc @veramo/credential-w3c#ICredentialProvider.createVerifiablePresentation} */
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
      presentation.verifiableCredential = args.presentation.verifiableCredential.map((cred) => {
        if (typeof cred !== 'string' && cred.proof.jwt) {
          return cred.proof.jwt
        } else {
          return cred
        }
      })
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

      return await this.ldCredentialModule.signLDVerifiablePresentation(
        presentation,
        identifier.did,
        signingKey,
        verificationMethodId,
        args.challenge || '',
        args.domain || '',
        { ...args, now },
        context,
      )
    } catch (error) {
      debug(error)
      return Promise.reject(error)
    }
  }

  /** {@inheritdoc @veramo/credential-w3c#ICredentialProvider.createVerifiableCredential} */
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

      return await this.ldCredentialModule.issueLDVerifiableCredential(
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

  /** {@inheritdoc @veramo/credential-w3c#ICredentialProvider.verifyCredential} */
  async verifyCredential(args: IVerifyCredentialArgs, context: VerifierAgentContext): Promise<IVerifyResult> {
    args.credential = args.credential as VerifiableCredential
    const credential = args.credential

    let now = new Date()

    if (args.policies?.now && typeof args.policies?.now === 'number') {
      now = new Date(args.policies?.now * 1000)
    }

    return this.ldCredentialModule.verifyCredential(credential, { ...args, now }, context)
  }

  /** {@inheritdoc @veramo/credential-w3c#ICredentialProvider.verifyPresentation} */
  async verifyPresentation(
    args: IVerifyPresentationArgs,
    context: VerifierAgentContext,
  ): Promise<IVerifyResult> {
    const presentation = args.presentation as VerifiablePresentation
    let { now } = args
    if (typeof now === 'number') {
      now = new Date(now * 1000)
    }
    return this.ldCredentialModule.verifyPresentation(
      presentation,
      args.challenge,
      args.domain,
      { ...args, now },
      context,
    )
  }

  /**
   * Returns true if the key is supported by any of the installed LD Signature suites
   * @param k - the key to match
   *
   * @internal
   */
  private matchKeyForLDSuite(k: IKey): boolean {
    // prefilter based on key algorithms
    switch (k.type) {
      case 'Ed25519':
        if (!k.meta?.algorithms?.includes('EdDSA')) return false
        break
      case 'Secp256k1':
        if (intersect(k.meta?.algorithms ?? [], ['ES256K-R', 'ES256K']).length == 0) return false
        break
    }

    // TODO: this should return a list of supported suites, not just a boolean
    const suites = this.ldCredentialModule.ldSuiteLoader.getAllSignatureSuites()
    return suites
      .map((suite: VeramoLdSignature) => suite.getSupportedVeramoKeyType().includes(k.type))
      .some((supportsThisKey: boolean) => supportsThisKey)
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
    let supportedTypes = this.ldCredentialModule.ldSuiteLoader.getAllSignatureSuiteTypes()
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
}
