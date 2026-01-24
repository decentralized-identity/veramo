import {
  IAgentContext,
  IAgentPlugin,
  ICreateVerifiableCredentialArgs,
  ICreateVerifiablePresentationArgs,
  ICredentialPlugin,
  ICredentialStatusVerifier,
  IIdentifier,
  IssuerAgentContext,
  IVerifyCredentialArgs,
  IVerifyPresentationArgs,
  IVerifyResult,
  ProofFormat,
  schema,
  VerifiableCredential,
  VerifiablePresentation,
  VerifierAgentContext,
} from '@veramo/core-types'

import { ICredentialProvider } from './abstract-credential-provider.js'

import { extractIssuer, isDefined, MANDATORY_CREDENTIAL_CONTEXT, processEntryToArray } from '@veramo/utils'
import Debug from 'debug'

const debug = Debug('veramo:w3c:action-handler')

/**
 * A Veramo plugin that implements the {@link @veramo/core-types#ICredentialPlugin | ICredentialPlugin} methods.
 *
 * @public
 */
export class CredentialPlugin implements IAgentPlugin {
  readonly methods: ICredentialPlugin
  readonly schema = {
    components: {
      schemas: {
        ...schema.ICredentialIssuer.components.schemas,
        ...schema.ICredentialVerifier.components.schemas,
      },
      methods: {
        ...schema.ICredentialIssuer.components.methods,
        ...schema.ICredentialVerifier.components.methods,
      },
    },
  }
  private issuers: ICredentialProvider[]

  constructor(issuers: ICredentialProvider[]) {
    this.issuers = issuers
    this.methods = {
      listUsableProofFormats: this.listUsableProofFormats.bind(this),
      createVerifiableCredential: this.createVerifiableCredential.bind(this),
      verifyCredential: this.verifyCredential.bind(this),
      createVerifiablePresentation: this.createVerifiablePresentation.bind(this),
      verifyPresentation: this.verifyPresentation.bind(this),
    }
  }

  /** {@inheritdoc @veramo/core-types#ICredentialIssuer.listUsableProofFormats} */
  async listUsableProofFormats(did: IIdentifier, context: IssuerAgentContext): Promise<ProofFormat[]> {
    const signingOptions: string[] = []
    const keys = did.keys
    for (const key of keys) {
      for (const issuer of this.issuers) {
        signingOptions.push(...issuer.getProofFormatsSupportedForKey(key))
      }
    }
    return signingOptions
  }

  /** {@inheritdoc @veramo/core-types#ICredentialIssuer.createVerifiableCredential} */
  async createVerifiableCredential(
    args: ICreateVerifiableCredentialArgs,
    context: IssuerAgentContext,
  ): Promise<VerifiableCredential> {
    let { credential, proofFormat, keyRef, removeOriginalFields, save, now, ...otherOptions } = args
    const credentialContext = processEntryToArray(credential['@context'], MANDATORY_CREDENTIAL_CONTEXT)
    const credentialType = processEntryToArray(credential.type, 'VerifiableCredential')

    // only add issuanceDate for JWT
    now = typeof now === 'number' ? new Date(now * 1000) : now
    if (!Object.getOwnPropertyNames(credential).includes('issuanceDate')) {
      credential.issuanceDate = (now instanceof Date ? now : new Date()).toISOString()
    }

    credential = {
      ...credential,
      '@context': credentialContext,
      type: credentialType,
    }

    //FIXME: if the identifier is not found, the error message should reflect that.
    const issuer = extractIssuer(credential, { removeParameters: true })
    if (!issuer || typeof issuer === 'undefined') {
      throw new Error('invalid_argument: credential.issuer must not be empty')
    }

    let identifier: IIdentifier
    try {
      identifier = await context.agent.didManagerGet({ did: issuer })
    } catch (e) {
      throw new Error(`invalid_argument: credential.issuer must be a DID managed by this agent. ${e}`)
    }
    try {
      let verifiableCredential: VerifiableCredential | undefined

      async function tryToIssueCredential(issuers: ICredentialProvider[]) {
        for (const issuer of issuers) {
          if (issuer.canIssueProofFormat({ proofFormat })) {
            return await issuer.createVerifiableCredential(args, context)
          }
        }
      }
      verifiableCredential = await tryToIssueCredential(this.issuers)

      if (!verifiableCredential) {
        throw new Error('invalid_setup: No issuer found for the requested proof format')
      }

      if (save) {
        await context.agent.dataStoreSaveVerifiableCredential({ verifiableCredential })
      }

      return verifiableCredential
    } catch (error) {
      debug(error)
      return Promise.reject(error)
    }
  }

  /** {@inheritdoc @veramo/core-types#ICredentialVerifier.verifyCredential} */
  async verifyCredential(args: IVerifyCredentialArgs, context: VerifierAgentContext): Promise<IVerifyResult> {
    let { credential, policies } = args

    async function getVerificationResult(issuers: ICredentialProvider[]): Promise<IVerifyResult | undefined> {
      for (const issuer of issuers) {
        if (issuer.canVerifyDocumentType({ document: credential })) {
          return issuer.verifyCredential(args, context)
        }
      }
    }
    let verificationResult = await getVerificationResult(this.issuers)
    if (!verificationResult) {
      throw new Error('invalid_setup: No verifier found for the provided credential')
    }
    const verifiedCredential = <VerifiableCredential>credential

    if (policies?.credentialStatus !== false && (await isRevoked(verifiedCredential, context as any))) {
      verificationResult = {
        verified: false,
        error: {
          message: 'revoked: The credential was revoked by the issuer',
          errorCode: 'revoked',
        },
      }
    }

    return verificationResult
  }

  /** {@inheritdoc @veramo/core-types#ICredentialIssuer.createVerifiablePresentation} */
  async createVerifiablePresentation(
    args: ICreateVerifiablePresentationArgs,
    context: IssuerAgentContext,
  ): Promise<VerifiablePresentation> {
    let { presentation, proofFormat, save } = args
    const presentationContext: string[] = processEntryToArray(
      args?.presentation?.['@context'],
      MANDATORY_CREDENTIAL_CONTEXT,
    )
    const presentationType = processEntryToArray(args?.presentation?.type, 'VerifiablePresentation')
    presentation = {
      ...presentation,
      '@context': presentationContext,
      type: presentationType,
    }

    if (!isDefined(presentation.holder)) {
      throw new Error('invalid_argument: presentation.holder must not be empty')
    }

    if (presentation.verifiableCredential) {
      presentation.verifiableCredential = presentation.verifiableCredential.map((cred) => {
        // map JWT credentials to their canonical form
        if (typeof cred !== 'string' && cred.proof.jwt) {
          return cred.proof.jwt
        } else {
          return cred
        }
      })
    }

    async function tryToCreatePresentation(issuers: ICredentialProvider[]) {
      for (const issuer of issuers) {
        if (issuer.canIssueProofFormat({ proofFormat })) {
          return await issuer.createVerifiablePresentation(args, context)
        }
      }
    }

    let verifiablePresentation = await tryToCreatePresentation(this.issuers)

    if (!verifiablePresentation) {
      throw new Error('invalid_setup: No issuer found for the requested proof format')
    }

    if (save) {
      await context.agent.dataStoreSaveVerifiablePresentation({ verifiablePresentation })
    }
    return verifiablePresentation
  }

  /** {@inheritdoc @veramo/core-types#ICredentialVerifier.verifyPresentation} */
  async verifyPresentation(
    args: IVerifyPresentationArgs,
    context: VerifierAgentContext,
  ): Promise<IVerifyResult> {
    async function tryVerification(issuers: ICredentialProvider[]): Promise<IVerifyResult | undefined> {
      for (const issuer of issuers) {
        if (issuer.canVerifyDocumentType({ document: args.presentation })) {
          return issuer.verifyPresentation(args, context)
        }
      }
    }
    let result = await tryVerification(this.issuers)
    if (!result) {
      throw new Error('invalid_setup: No verifier found for the provided presentation')
    }
    return result
  }
}

async function isRevoked(
  credential: VerifiableCredential,
  context: IAgentContext<ICredentialStatusVerifier>,
): Promise<boolean> {
  if (!credential.credentialStatus) return false

  if (typeof context.agent.checkCredentialStatus === 'function') {
    const status = await context.agent.checkCredentialStatus({ credential })
    return status?.revoked == true || status?.verified === false
  }

  throw new Error(
    `invalid_setup: The credential status can't be verified because there is no ICredentialStatusVerifier plugin installed.`,
  )
}
