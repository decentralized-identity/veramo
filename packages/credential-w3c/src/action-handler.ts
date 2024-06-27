import {
  IAgentContext,
  IAgentPlugin,
  ICreateVerifiableCredentialArgs,
  ICreateVerifiablePresentationArgs,
  ICredentialPlugin,
  ICredentialStatusVerifier,
  IIdentifier,
  IKey,
  IssuerAgentContext,
  IVerifyCredentialArgs,
  IVerifyPresentationArgs,
  IVerifyResult,
  VerifiableCredential,
  VerifiablePresentation,
  VerifierAgentContext,
  ICanIssueCredentialTypeArgs,
  ICanVerifyDocumentTypeArgs,
} from '@veramo/core-types'

import { AbstractCredentialProvider } from './abstract-credential-provider.js'

import { schema } from '@veramo/core-types'

import {
  extractIssuer,
  removeDIDParameters,
  isDefined,
  MANDATORY_CREDENTIAL_CONTEXT,
  processEntryToArray,
} from '@veramo/utils'
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
  private issuers: AbstractCredentialProvider[]

  constructor({ issuers = [] }: { issuers: AbstractCredentialProvider[] }) {
    this.issuers = issuers
    this.methods = {
      listUsableProofFormats: this.listUsableProofFormats.bind(this),
      createVerifiableCredential: this.createVerifiableCredential.bind(this),
      verifyCredential: this.verifyCredential.bind(this),
      createVerifiablePresentation: this.createVerifiablePresentation.bind(this),
      verifyPresentation: this.verifyPresentation.bind(this),
    }
  }

  async listUsableProofFormats(did: IIdentifier, context: IssuerAgentContext): Promise<string[]> {
    const signingOptions: string[] = []
    const keys = did.keys
    for (const key of keys) {
      for (const issuer of this.issuers) {
        if (issuer.matchKeyForType(key)) {
          signingOptions.push(issuer.getTypeProofFormat())
        }
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

      async function getCredential(issuers: AbstractCredentialProvider[]) {
        for (const issuer of issuers) {
          if (issuer.canIssueCredentialType({ proofFormat })) {
            return await issuer.createVerifiableCredential(args, context)
          }
        }
      }
      verifiableCredential = await getCredential(this.issuers)

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
    let { credential, policies, ...otherOptions } = args
    let verifiedCredential: VerifiableCredential
    let verificationResult: IVerifyResult | undefined = { verified: false }

    async function getVerificationResult(issuers: AbstractCredentialProvider[]): Promise<IVerifyResult | undefined> {
      for (const issuer of issuers) {
        if (issuer.canVerifyDocumentType({ document: credential })) {
          return issuer.verifyCredential(args, context)
        }
      }
    }
    verificationResult = await getVerificationResult(this.issuers)
    if (!verificationResult) {
      throw new Error('invalid_setup: No verifier found for the provided credential')
    }
    verifiedCredential = <VerifiableCredential>credential

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
    let {
      presentation,
      proofFormat,
      domain,
      challenge,
      removeOriginalFields,
      keyRef,
      save,
      now,
      ...otherOptions
    } = args
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

    const holder = removeDIDParameters(presentation.holder)

    let identifier: IIdentifier
    try {
      identifier = await context.agent.didManagerGet({ did: holder })
    } catch (e) {
      throw new Error('invalid_argument: presentation.holder must be a DID managed by this agent')
    }
    const key = pickSigningKey(identifier, keyRef)

    let verifiablePresentation: VerifiablePresentation | undefined

    async function getPresentation(issuers: AbstractCredentialProvider[]) {
      for (const issuer of issuers) {
        if (issuer.canIssueCredentialType({ proofFormat })) {
          return await issuer.createVerifiablePresentation(args, context)
        }
      }
    }

    verifiablePresentation = await getPresentation(this.issuers)

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
    let { presentation, domain, challenge, fetchRemoteContexts, policies, ...otherOptions } = args
    let result: IVerifyResult | undefined = { verified: false }
    async function getVerificationResult(issuers: AbstractCredentialProvider[]): Promise<IVerifyResult | undefined> {
      for (const issuer of issuers) {
        if (issuer.canVerifyDocumentType({ document: presentation })) {
          return issuer.verifyPresentation(args, context)
        }
      }
    }
    result = await getVerificationResult(this.issuers)
    if (!result) {
      throw new Error('invalid_setup: No verifier found for the provided presentation')
    }
    return result
  }
}

function pickSigningKey(identifier: IIdentifier, keyRef?: string): IKey {
  let key: IKey | undefined

  if (!keyRef) {
    key = identifier.keys.find(
      (k) => k.type === 'Secp256k1' || k.type === 'Ed25519' || k.type === 'Secp256r1',
    )
    if (!key) throw Error('key_not_found: No signing key for ' + identifier.did)
  } else {
    key = identifier.keys.find((k) => k.kid === keyRef)
    if (!key) throw Error('key_not_found: No signing key for ' + identifier.did + ' with kid ' + keyRef)
  }

  return key as IKey
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
