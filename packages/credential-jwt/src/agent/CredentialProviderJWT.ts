import {
  CredentialPayload,
  IAgentPlugin,
  ICreateVerifiableCredentialArgs,
  ICanIssueCredentialTypeArgs,
  IIdentifier,
  IKey,
  IssuerAgentContext,
  VerifiableCredential,
  VerifiablePresentation,
  IAgentContext,
  IKeyManager,
  ICreateVerifiablePresentationArgs,
  IVerifyCredentialArgs,
  IVerifyResult,
  IVerifyPresentationArgs,
  ICanVerifyDocumentTypeArgs,
  VerifierAgentContext,
} from '@veramo/core-types'
import {
  asArray,
  extractIssuer,
  intersect,
  isDefined,
  MANDATORY_CREDENTIAL_CONTEXT,
  pickSigningKey,
  processEntryToArray,
  removeDIDParameters,
} from '@veramo/utils'
import { AbstractCredentialProvider } from '@veramo/credential-w3c'

import canonicalize from 'canonicalize'

import {
  createVerifiableCredentialJwt,
  createVerifiablePresentationJwt,
  normalizeCredential,
  normalizePresentation,
  verifyCredential as verifyCredentialJWT,
  verifyPresentation as verifyPresentationJWT,
} from 'did-jwt-vc'
import { Resolvable } from 'did-resolver'

import { decodeJWT } from 'did-jwt'

import Debug from 'debug'
const debug = Debug('veramo:credential-jwt:agent')

/**
 * A handler that implements the {@link AbstractCredentialProvider} methods.
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export class CredentialProviderJWT implements AbstractCredentialProvider {

  /** {@inheritdoc @veramo/credential-w3c#AbstractCredentialProvider.matchKeyForType} */
  matchKeyForType(key: IKey): boolean {
    return this.matchKeyForJWT(key)
  }

  /** {@inheritdoc @veramo/credential-w3c#AbstractCredentialProvider.getTypeProofFormat} */
  getTypeProofFormat(): string {
    return 'jwt'
  }

  /** {@inheritdoc @veramo/credential-w3c#AbstractCredentialProvider.canIssueCredentialType} */
  canIssueCredentialType(args: ICanIssueCredentialTypeArgs): boolean {
    return args.proofFormat === 'jwt'
  }

  /** {@inheritdoc @veramo/credential-w3c#AbstractCredentialProvider.canVerifyDocumentType */
  canVerifyDocumentType(args: ICanVerifyDocumentTypeArgs): boolean {
    const { document } = args
    return typeof document === 'string' || (<VerifiableCredential>document)?.proof?.jwt
  }

  /** {@inheritdoc @veramo/credential-w3c#AbstractCredentialProvider.createVerifiableCredential} */
  async createVerifiableCredential(
    args: ICreateVerifiableCredentialArgs,
    context: IssuerAgentContext,
  ): Promise<VerifiableCredential> {
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
    return normalizeCredential(jwt)
  }

  /** {@inheritdoc ICredentialVerifier.verifyCredential} */
  async verifyCredential(
    args: IVerifyCredentialArgs,
    context: VerifierAgentContext,
  ): Promise<IVerifyResult> {
    let { credential, policies, ...otherOptions } = args
    let verifiedCredential: VerifiableCredential
    let verificationResult: IVerifyResult | undefined = { verified: false }
    let jwt: string = typeof credential === 'string' ? credential : credential.proof.jwt
    let errorCode, message
    const resolver = {
      resolve: (didUrl: string) =>
        context.agent.resolveDid({
          didUrl,
          options: otherOptions?.resolutionOptions,
        }),
    } as Resolvable
    try {
      // needs broader credential as well to check equivalence with jwt
      verificationResult = await verifyCredentialJWT(jwt, resolver, {
        ...otherOptions,
        policies: {
          ...policies,
          nbf: policies?.nbf ?? policies?.issuanceDate,
          iat: policies?.iat ?? policies?.issuanceDate,
          exp: policies?.exp ?? policies?.expirationDate,
          aud: policies?.aud ?? policies?.audience,
        },
      })
      verifiedCredential = verificationResult.verifiableCredential

      // if credential was presented with other fields, make sure those fields match what's in the JWT
      if (typeof credential !== 'string' && credential.proof.type === 'JwtProof2020') {
        const credentialCopy = JSON.parse(JSON.stringify(credential))
        delete credentialCopy.proof.jwt

        const verifiedCopy = JSON.parse(JSON.stringify(verifiedCredential))
        delete verifiedCopy.proof.jwt

        if (canonicalize(credentialCopy) !== canonicalize(verifiedCopy)) {
          verificationResult.verified = false
          verificationResult.error = new Error(
            'invalid_credential: Credential JSON does not match JWT payload',
          )
        }
      }
    } catch (e: any) {
      errorCode = e.errorCode
      message = e.message
    }
    if (verificationResult.verified) {
      return verificationResult
    }
    return {
      verified: false,
      error: {
        message,
        errorCode: errorCode ? errorCode : message?.split(':')[0],
      },
    }
  }

  /** {@inheritdoc @veramo/credential-w3c#AbstractCredentialProvider.createVerifiablePresentation} */
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

  /** {@inheritdoc @veramo/credential-w3c#AbstractCredentialProvider.verifyPresentation} */
  async verifyPresentation(
    args: IVerifyPresentationArgs,
    context: VerifierAgentContext,
  ): Promise<IVerifyResult> {
    let { presentation, domain, challenge, fetchRemoteContexts, policies, ...otherOptions } = args
    let jwt: string
    if (typeof presentation === 'string') {
      jwt = presentation
    } else {
      jwt = presentation.proof.jwt
    }
    const resolver = {
      resolve: (didUrl: string) =>
        context.agent.resolveDid({
          didUrl,
          options: otherOptions?.resolutionOptions,
        }),
    } as Resolvable

    let audience = domain
    if (!audience) {
      const { payload } = await decodeJWT(jwt)
      if (payload.aud) {
        // automatically add a managed DID as audience if one is found
        const intendedAudience = asArray(payload.aud)
        const managedDids = await context.agent.didManagerFind()
        const filtered = managedDids.filter((identifier) => intendedAudience.includes(identifier.did))
        if (filtered.length > 0) {
          audience = filtered[0].did
        }
      }
    }

    let message, errorCode
    try {
      const result = await verifyPresentationJWT(jwt, resolver, {
        challenge,
        domain,
        audience,
        policies: {
          ...policies,
          nbf: policies?.nbf ?? policies?.issuanceDate,
          iat: policies?.iat ?? policies?.issuanceDate,
          exp: policies?.exp ?? policies?.expirationDate,
          aud: policies?.aud ?? policies?.audience,
        },
        ...otherOptions,
      })
      if (result) {
        return {
          verified: true,
          verifiablePresentation: result,
        }
      }
    } catch (e: any) {
      message = e.message
      errorCode = e.errorCode
    }
    return {
      verified: false,
      error: {
        message,
        errorCode: errorCode ? errorCode : message?.split(':')[0],
      },
    }
  }

  /**
   * Checks if a key is suitable for signing JWT payloads.
   * @param key - the key to check
   * @param context - the Veramo agent context, unused here
   *
   * @beta
   */
  matchKeyForJWT(key: IKey): boolean {
    switch (key.type) {
      case 'Ed25519':
      case 'Secp256r1':
        return true
      case 'Secp256k1':
        return intersect(key.meta?.algorithms ?? [], ['ES256K', 'ES256K-R']).length > 0
      default:
        return false
    }
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

