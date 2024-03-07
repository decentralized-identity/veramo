import {
  CredentialPayload,
  IAgentContext,
  IAgentPlugin,
  IIdentifier,
  IKey,
  IResolver,
  PresentationPayload,
  VerifiableCredential,
  VerifiablePresentation,
} from '@veramo/core-types'
import { VeramoLdSignature } from './index.js'
import { schema } from './plugin.schema.js'
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
import {
  ContextDoc,
  ICreateVerifiableCredentialLDArgs,
  ICreateVerifiablePresentationLDArgs,
  ICredentialIssuerLD,
  IRequiredContext,
  IVerifyCredentialLDArgs,
  IVerifyPresentationLDArgs,
} from './types.js'
import { DIDResolutionOptions } from 'did-resolver'

const debug = Debug('veramo:credential-ld:action-handler')

/**
 * A Veramo plugin that implements the {@link ICredentialIssuerLD} methods.
 *
 * @public
 */
export class CredentialIssuerLD implements IAgentPlugin {
  readonly methods: ICredentialIssuerLD
  readonly schema = schema.ICredentialIssuerLD

  private ldCredentialModule: LdCredentialModule

  constructor(options: { contextMaps: RecordLike<OrPromise<ContextDoc>>[]; suites: VeramoLdSignature[] }) {
    this.ldCredentialModule = new LdCredentialModule({
      ldContextLoader: new LdContextLoader({ contextsPaths: options.contextMaps }),
      ldSuiteLoader: new LdSuiteLoader({ veramoLdSignatures: options.suites }),
    })

    this.methods = {
      createVerifiablePresentationLD: this.createVerifiablePresentationLD.bind(this),
      createVerifiableCredentialLD: this.createVerifiableCredentialLD.bind(this),
      verifyCredentialLD: this.verifyCredentialLD.bind(this),
      verifyPresentationLD: this.verifyPresentationLD.bind(this),
      matchKeyForLDSuite: this.matchKeyForLDSuite.bind(this),
    }
  }

  /** {@inheritdoc ICredentialIssuerLD.createVerifiablePresentationLD} */
  public async createVerifiablePresentationLD(
    args: ICreateVerifiablePresentationLDArgs,
    context: IRequiredContext,
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

  /** {@inheritdoc ICredentialIssuerLD.createVerifiableCredentialLD} */
  public async createVerifiableCredentialLD(
    args: ICreateVerifiableCredentialLDArgs,
    context: IRequiredContext,
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

  /** {@inheritdoc ICredentialIssuerLD.verifyCredentialLD} */
  public async verifyCredentialLD(
    args: IVerifyCredentialLDArgs,
    context: IRequiredContext,
  ): Promise<boolean> {
    const credential = args.credential

    let { now } = args
    if (typeof now === 'number') {
      now = new Date(now * 1000)
    }

    return this.ldCredentialModule.verifyCredential(credential, { ...args, now }, context)
  }

  /** {@inheritdoc ICredentialIssuerLD.verifyPresentationLD} */
  public async verifyPresentationLD(
    args: IVerifyPresentationLDArgs,
    context: IRequiredContext,
  ): Promise<boolean> {
    const presentation = args.presentation
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

  /**
   * Returns true if the key is supported by any of the installed LD Signature suites
   * @param k - the key to match
   *
   * @internal
   */
  async matchKeyForLDSuite(k: IKey): Promise<boolean> {
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
}
