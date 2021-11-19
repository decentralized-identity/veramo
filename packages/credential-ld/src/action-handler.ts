import {
  IAgentContext,
  IAgentPlugin,
  IIdentifier,
  IKey,
  IResolver,
  VerifiableCredential,
  VerifiablePresentation,
} from '@veramo/core'
import { schema, VeramoLdSignature } from './'
import Debug from 'debug'
import { LdContextLoader } from "./ld-context-loader";
import { _ExtendedIKey, asArray, mapIdentifierKeysToDoc, RecordLike, OrPromise } from "@veramo/utils";

import { LdCredentialModule } from "./ld-credential-module";
import { LdSuiteLoader } from './ld-suite-loader';
import {
  ContextDoc,
  CredentialPayload,
  ICreateVerifiableCredentialLDArgs,
  ICreateVerifiablePresentationLDArgs,
  ICredentialIssuerLD,
  IRequiredContext,
  IVerifyCredentialLDArgs,
  IVerifyPresentationLDArgs,
  MANDATORY_CREDENTIAL_CONTEXT,
  PresentationPayload,
} from "./types";

const debug = Debug('veramo:w3c:action-handler')

/**
 * A Veramo plugin that implements the {@link ICredentialIssuerLD} methods.
 *
 * @public
 */
export class CredentialIssuerLD implements IAgentPlugin {
  readonly methods: ICredentialIssuerLD
  readonly schema = schema.ICredentialIssuer

  private ldCredentialModule: LdCredentialModule

  constructor(options: {
    contextMaps: RecordLike<OrPromise<ContextDoc>>[],
    suites: VeramoLdSignature[]
  }) {
    this.ldCredentialModule = new LdCredentialModule({
      ldContextLoader: new LdContextLoader({ contextsPaths: options.contextMaps }),
      ldSuiteLoader: new LdSuiteLoader({ veramoLdSignatures: options.suites })
    })

    this.methods = {
      createVerifiablePresentationLD: this.createVerifiablePresentationLD.bind(this),
      createVerifiableCredentialLD: this.createVerifiableCredentialLD.bind(this),
      verifyCredentialLD: this.verifyCredentialLD.bind(this),
      verifyPresentationLD: this.verifyPresentationLD.bind(this),
    }
  }

  /** {@inheritdoc ICredentialIssuerLD.createVerifiablePresentationLD} */
  public async createVerifiablePresentationLD(
    args: ICreateVerifiablePresentationLDArgs,
    context: IRequiredContext,
  ): Promise<VerifiablePresentation> {
    const presentationContext: string[] = asArray<string>(args?.presentation?.['@context'] || []) || ['https://www.w3.org/2018/credentials/v1']
    if (presentationContext[0] !== MANDATORY_CREDENTIAL_CONTEXT) {
      presentationContext.unshift(MANDATORY_CREDENTIAL_CONTEXT)
    }
    const presentationType = asArray<string>(args?.presentation?.type || []) || ['VerifiablePresentation']
    if (presentationType[0] !== 'VerifiablePresentation') {
      presentationType.unshift('VerifiablePresentation')
    }

    const presentation: Partial<PresentationPayload> = {
      ...args?.presentation,
      '@context': presentationContext,
      type: presentationType,
    }
    //issuanceDate must not be present for presentations because it is not defined in a @context
    delete presentation.issuanceDate

    // FIXME: if credentials use the internal JwtProof2020, map them to only use JWT before bundling the presentation

    if (!presentation.holder || typeof presentation.holder === 'undefined') {
      throw new Error('invalid_argument: args.presentation.holder must not be empty')
    }

    let identifier: IIdentifier
    try {
      identifier = await context.agent.didManagerGet({ did: presentation.holder })
    } catch (e) {
      throw new Error('invalid_argument: args.presentation.holder must be a DID managed by this agent')
    }
    try {
      const { signingKey, verificationMethodId } = await this.findSigningKeyWithId(context, identifier, args.keyRef)

      return await this.ldCredentialModule.signLDVerifiablePresentation(
        presentation,
        identifier.did,
        signingKey,
        verificationMethodId,
        args.challenge,
        args.domain,
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
    const credentialContext: string[] = asArray<string>(args?.credential?.['@context'] || []) || ['https://www.w3.org/2018/credentials/v1']
    if (credentialContext[0] !== MANDATORY_CREDENTIAL_CONTEXT) {
      credentialContext.unshift(MANDATORY_CREDENTIAL_CONTEXT)
    }
    const credentialType = asArray<string>(args?.credential?.type || []) || ['VerifiableCredential']
    if (credentialType[0] !== 'VerifiableCredential') {
      credentialType.unshift('VerifiableCredential')
    }
    let issuanceDate = args?.credential?.issuanceDate || new Date().toISOString()
    if (issuanceDate instanceof Date) {
      issuanceDate = issuanceDate.toISOString()
    }
    const credential: Partial<CredentialPayload> = {
      ...args?.credential,
      '@context': credentialContext,
      type: credentialType,
      issuanceDate,
    }

    const issuer = typeof credential.issuer === 'string' ? credential.issuer : credential?.issuer?.id
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
      const { signingKey, verificationMethodId } = await this.findSigningKeyWithId(context, identifier, args.keyRef)

      return await this.ldCredentialModule.issueLDVerifiableCredential(
        credential,
        identifier.did,
        signingKey,
        verificationMethodId,
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
    return this.ldCredentialModule.verifyCredential(credential, context)
  }

  /** {@inheritdoc ICredentialIssuerLD.verifyPresentationLD} */
  public async verifyPresentationLD(
    args: IVerifyPresentationLDArgs,
    context: IRequiredContext,
  ): Promise<boolean> {
    const presentation = args.presentation
    return this.ldCredentialModule.verifyPresentation(
      presentation,
      args.challenge,
      args.domain,
      context,
    )
  }

  private async findSigningKeyWithId(context: IAgentContext<IResolver>, identifier: IIdentifier, keyRef?: string): Promise<{ signingKey: IKey; verificationMethodId: string }> {
    const extendedKeys: _ExtendedIKey[] = await mapIdentifierKeysToDoc(identifier, 'assertionMethod', context)
    let supportedTypes = this.ldCredentialModule.ldSuiteLoader.getAllSignatureSuiteTypes()
    let signingKey: _ExtendedIKey | undefined
    let verificationMethodId: string
    if (keyRef) {
      signingKey = extendedKeys.find((k) => k.kid === keyRef)
    }
    if (signingKey && !supportedTypes.includes(signingKey.meta.verificationMethod.type)) {
      debug('WARNING: requested signing key DOES NOT correspond to a supported Signature suite type. Looking for the next best key.')
      signingKey = undefined
    }
    if (!signingKey) {
      if (keyRef) {
        debug('WARNING: no signing key was found that matches the reference provided. Searching for the first available signing key.')
      }
      signingKey = extendedKeys.find((k) => supportedTypes.includes(k.meta.verificationMethod.type))
    }

    if (!signingKey) throw Error(`key_not_found: No suitable signing key found for ${identifier.did}`)
    verificationMethodId = signingKey.meta.verificationMethod.id
    return { signingKey, verificationMethodId }
  }
}

