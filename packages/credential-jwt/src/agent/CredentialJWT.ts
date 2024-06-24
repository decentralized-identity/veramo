import {
  CredentialPayload,
  IAgentPlugin,
  ICreateVerifiableCredentialArgs,
  ICanIssueCredentialTypeArgs,
  IIdentifier,
  IKey,
  IssuerAgentContext,
  PresentationPayload,
  VerifiableCredential,
  VerifiablePresentation,
  ISpecificCredentialIssuer,
  IAgentContext,
  IKeyManager,
  // ICanCreateVerifiableCredentialArgs
} from '@veramo/core-types'
import {
  extractIssuer,
  getChainId,
  getEthereumAddress,
  intersect,
  isDefined,
  MANDATORY_CREDENTIAL_CONTEXT,
  mapIdentifierKeysToDoc,
  pickSigningKey,
  processEntryToArray,
  removeDIDParameters,
  resolveDidOrThrow,
} from '@veramo/utils'
import { schema } from '../plugin.schema.js'

import { recoverTypedSignature, SignTypedDataVersion } from '@metamask/eth-sig-util'
import {
  ICreateVerifiableCredentialJWTArgs,
  ICreateVerifiablePresentationJWTArgs,
  ICredentialIssuerJWT,
  IRequiredContext,
  IVerifyCredentialJWTArgs,
  IVerifyPresentationJWTArgs,
} from '../types/ICredentialJWT.js'


import {
  createVerifiableCredentialJwt,
  createVerifiablePresentationJwt,
  normalizeCredential,
  normalizePresentation,
  verifyCredential as verifyCredentialJWT,
  verifyPresentation as verifyPresentationJWT,
} from 'did-jwt-vc'

import Debug from 'debug'
const debug = Debug('veramo:credential-jwt:agent')

/**
 * A Veramo plugin that implements the {@link ICredentialIssuerJWT} methods.
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export class CredentialIssuerJWT implements IAgentPlugin, ISpecificCredentialIssuer {
  readonly methods: ICredentialIssuerJWT
  readonly schema = schema.ICredentialIssuerJWT

  constructor() {
    this.methods = {
      createVerifiableCredentialJWT: this.createVerifiableCredentialJWT.bind(this),
      createVerifiablePresentationJWT: this.createVerifiablePresentationJWT.bind(this),
      verifyCredentialJWT: this.verifyCredentialJWT.bind(this),
      verifyPresentationJWT: this.verifyPresentationJWT.bind(this),
      matchKeyForJWT: this.matchKeyForJWT.bind(this),
      // canIssueCredentialType: this.canIssueCredentialType.bind(this),
      // issueCredentialType: this.issueCredentialType.bind(this),
    }
  }

  public canIssueCredentialType(args: ICanIssueCredentialTypeArgs, context: IssuerAgentContext): boolean {
    return args.proofFormat === 'jwt'
  }

  public issueCredentialType(
    args: ICreateVerifiableCredentialArgs,
    context: IssuerAgentContext,
  ): Promise<VerifiableCredential> {
    return context.agent.createVerifiableCredentialJWT(args)
  }

  /** {@inheritdoc ICredentialIssuerJWT.createVerifiableCredentialJWT} */
  public async createVerifiableCredentialJWT(
    args: ICreateVerifiableCredentialJWTArgs,
    context: IRequiredContext,
  ): Promise<VerifiableCredential> {
    console.log("1!!!!!")
    let { proofFormat, keyRef, removeOriginalFields, save, now, ...otherOptions } = args

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

    const key = pickSigningKey(identifier, keyRef)

    debug('Signing VC with', identifier.did)
    let alg = 'ES256K'
    if (key.type === 'Ed25519') {
      alg = 'EdDSA'
    } else if (key.type === 'Secp256r1') {
      alg = 'ES256'
    }

    const signer = this.wrapSigner(context, key, alg)
    const jwt = await createVerifiableCredentialJwt(
      credential as any,
      { did: identifier.did, signer, alg },
      { removeOriginalFields, ...otherOptions },
    )
    //FIXME: flagging this as a potential privacy leak.
    debug(jwt)
    console.log("JWT: ", jwt)
    return normalizeCredential(jwt)
  }

  /** {@inheritdoc ICredentialIssuerJWT.verifyCredentialJWT} */
  private async verifyCredentialJWT(
    args: IVerifyCredentialJWTArgs,
    context: IRequiredContext,
  ): Promise<boolean> {
    throw new Error('not implemented')
  }

  /** {@inheritdoc ICredentialIssuerJWT.createVerifiablePresentationJWT} */
  async createVerifiablePresentationJWT(
    args: ICreateVerifiablePresentationJWTArgs,
    context: IRequiredContext,
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
    // only add issuanceDate for JWT
    now = typeof now === 'number' ? new Date(now * 1000) : now
    if (!Object.getOwnPropertyNames(presentation).includes('issuanceDate')) {
      presentation.issuanceDate = (now instanceof Date ? now : new Date()).toISOString()
    }

    debug('Signing VP with', identifier.did)
    let alg = 'ES256K'
    if (key.type === 'Ed25519') {
      alg = 'EdDSA'
    } else if (key.type === 'Secp256r1') {
      alg = 'ES256'
    }

    const signer = this.wrapSigner(context, key, alg)
    const jwt = await createVerifiablePresentationJwt(
      presentation as any,
      { did: identifier.did, signer, alg },
      { removeOriginalFields, challenge, domain, ...otherOptions },
    )
    //FIXME: flagging this as a potential privacy leak.
    debug(jwt)
    return normalizePresentation(jwt)
  }

  /** {@inheritdoc ICredentialIssuerJWT.verifyPresentationJWT} */
  private async verifyPresentationJWT(
    args: IVerifyPresentationJWTArgs,
    context: IRequiredContext,
  ): Promise<boolean> {
    throw new Error('not implemented')
  }

  /**
   * Checks if a key is suitable for signing JWT payloads.
   * @param key - the key to check
   * @param context - the Veramo agent context, unused here
   *
   * @beta
   */
  async matchKeyForJWT(key: IKey, context: IRequiredContext): Promise<boolean> {
    switch (key.type) {
      case 'Ed25519':
      case 'Secp256r1':
        return true
      case 'Secp256k1':
        return intersect(key.meta?.algorithms ?? [], ['ES256K', 'ES256K-R']).length > 0
      default:
        return false
    }
    return false
  }

  wrapSigner(
    context: IAgentContext<Pick<IKeyManager, 'keyManagerSign'>>,
    key: IKey,
    algorithm?: string,
  ) {
    return async (data: string | Uint8Array): Promise<string> => {
      const result = await context.agent.keyManagerSign({ keyRef: key.kid, data: <string>data, algorithm })
      return result
    }
  }
}

