import {
  IAgentContext,
  IAgentPlugin,
  ICreateVerifiableCredentialArgs,
  ICreateVerifiablePresentationArgs,
  ICredentialPlugin,
  ICredentialStatusVerifier,
  IIdentifier,
  IKey,
  IKeyManager,
  IssuerAgentContext,
  IVerifyCredentialArgs,
  IVerifyPresentationArgs,
  IVerifyResult,
  ProofFormat,
  VerifiableCredential,
  VerifiablePresentation,
  VerifierAgentContext,
  W3CVerifiableCredential,
  W3CVerifiablePresentation,
} from '@veramo/core-types'

import { schema } from '@veramo/core-types'

import {
  createVerifiableCredentialJwt,
  createVerifiablePresentationJwt,
  normalizeCredential,
  normalizePresentation,
  verifyCredential as verifyCredentialJWT,
  verifyPresentation as verifyPresentationJWT,
} from 'did-jwt-vc'

import { decodeJWT } from 'did-jwt'

import {
  asArray,
  extractIssuer,
  removeDIDParameters,
  isDefined,
  MANDATORY_CREDENTIAL_CONTEXT,
  processEntryToArray,
  intersect,
} from '@veramo/utils'
import Debug from 'debug'
import { Resolvable } from 'did-resolver'

import canonicalize from 'canonicalize'

const enum DocumentFormat {
  JWT,
  JSONLD,
  EIP712,
}

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

  constructor() {
    this.methods = {
      createVerifiablePresentation: this.createVerifiablePresentation.bind(this),
      createVerifiableCredential: this.createVerifiableCredential.bind(this),
      verifyCredential: this.verifyCredential.bind(this),
      verifyPresentation: this.verifyPresentation.bind(this),
      matchKeyForJWT: this.matchKeyForJWT.bind(this),
      listUsableProofFormats: this.listUsableProofFormats.bind(this),
    }
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

    let verifiablePresentation: VerifiablePresentation

    if (proofFormat === 'lds') {
      if (typeof context.agent.createVerifiablePresentationLD === 'function') {
        verifiablePresentation = await context.agent.createVerifiablePresentationLD({ ...args, presentation })
      } else {
        throw new Error(
          'invalid_setup: your agent does not seem to have ICredentialIssuerLD plugin installed',
        )
      }
    } else if (proofFormat === 'EthereumEip712Signature2021') {
      if (typeof context.agent.createVerifiablePresentationEIP712 === 'function') {
        verifiablePresentation = await context.agent.createVerifiablePresentationEIP712({
          ...args,
          presentation,
        })
      } else {
        throw new Error(
          'invalid_setup: your agent does not seem to have ICredentialIssuerEIP712 plugin installed',
        )
      }
    } else {
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

      const signer = wrapSigner(context, key, alg)
      const jwt = await createVerifiablePresentationJwt(
        presentation as any,
        { did: identifier.did, signer, alg },
        { removeOriginalFields, challenge, domain, ...otherOptions },
      )
      //FIXME: flagging this as a potential privacy leak.
      debug(jwt)
      verifiablePresentation = normalizePresentation(jwt)
    }
    if (save) {
      await context.agent.dataStoreSaveVerifiablePresentation({ verifiablePresentation })
    }
    return verifiablePresentation
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
      let verifiableCredential: VerifiableCredential
      if (proofFormat === 'lds') {
        if (typeof context.agent.createVerifiableCredentialLD === 'function') {
          verifiableCredential = await context.agent.createVerifiableCredentialLD({ ...args, credential })
        } else {
          throw new Error(
            'invalid_setup: your agent does not seem to have ICredentialIssuerLD plugin installed',
          )
        }
      } else if (proofFormat === 'EthereumEip712Signature2021') {
        if (typeof context.agent.createVerifiableCredentialEIP712 === 'function') {
          verifiableCredential = await context.agent.createVerifiableCredentialEIP712({ ...args, credential })
        } else {
          throw new Error(
            'invalid_setup: your agent does not seem to have ICredentialIssuerEIP712 plugin installed',
          )
        }
      } else {
        const key = pickSigningKey(identifier, keyRef)

        debug('Signing VC with', identifier.did)
        let alg = 'ES256K'
        if (key.type === 'Ed25519') {
          alg = 'EdDSA'
        } else if (key.type === 'Secp256r1') {
          alg = 'ES256'
        }

        const signer = wrapSigner(context, key, alg)
        const jwt = await createVerifiableCredentialJwt(
          credential as any,
          { did: identifier.did, signer, alg },
          { removeOriginalFields, ...otherOptions },
        )
        //FIXME: flagging this as a potential privacy leak.
        debug(jwt)
        verifiableCredential = normalizeCredential(jwt)
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
    let verificationResult: IVerifyResult = { verified: false }

    const type: DocumentFormat = detectDocumentType(credential)
    if (type == DocumentFormat.JWT) {
      let jwt: string = typeof credential === 'string' ? credential : credential.proof.jwt

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
        let { message, errorCode } = e
        return {
          verified: false,
          error: {
            message,
            errorCode: errorCode ? errorCode : message.split(':')[0],
          },
        }
      }
    } else if (type == DocumentFormat.EIP712) {
      if (typeof context.agent.verifyCredentialEIP712 !== 'function') {
        throw new Error(
          'invalid_setup: your agent does not seem to have ICredentialIssuerEIP712 plugin installed',
        )
      }

      try {
        const result = await context.agent.verifyCredentialEIP712(args)
        if (result) {
          verificationResult = {
            verified: true,
          }
        } else {
          verificationResult = {
            verified: false,
            error: {
              message: 'invalid_signature: The signature does not match any of the issuer signing keys',
              errorCode: 'invalid_signature',
            },
          }
        }
        verifiedCredential = <VerifiableCredential>credential
      } catch (e: any) {
        debug('encountered error while verifying EIP712 credential: %o', e)
        const { message, errorCode } = e
        return {
          verified: false,
          error: {
            message,
            errorCode: errorCode ? errorCode : e.message.split(':')[0],
          },
        }
      }
    } else if (type == DocumentFormat.JSONLD) {
      if (typeof context.agent.verifyCredentialLD !== 'function') {
        throw new Error(
          'invalid_setup: your agent does not seem to have ICredentialIssuerLD plugin installed',
        )
      }

      verificationResult = await context.agent.verifyCredentialLD({ ...args, now: policies?.now })
      verifiedCredential = <VerifiableCredential>credential
    } else {
      throw new Error('invalid_argument: Unknown credential type.')
    }

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

  /** {@inheritdoc @veramo/core-types#ICredentialVerifier.verifyPresentation} */
  async verifyPresentation(
    args: IVerifyPresentationArgs,
    context: VerifierAgentContext,
  ): Promise<IVerifyResult> {
    let { presentation, domain, challenge, fetchRemoteContexts, policies, ...otherOptions } = args
    const type: DocumentFormat = detectDocumentType(presentation)
    if (type === DocumentFormat.JWT) {
      // JWT
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

      try {
        return await verifyPresentationJWT(jwt, resolver, {
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
      } catch (e: any) {
        let { message, errorCode } = e
        return {
          verified: false,
          error: {
            message,
            errorCode: errorCode ? errorCode : message.split(':')[0],
          },
        }
      }
    } else if (type === DocumentFormat.EIP712) {
      // JSON-LD
      if (typeof context.agent.verifyPresentationEIP712 !== 'function') {
        throw new Error(
          'invalid_setup: your agent does not seem to have ICredentialIssuerEIP712 plugin installed',
        )
      }
      try {
        const result = await context.agent.verifyPresentationEIP712(args)
        if (result) {
          return {
            verified: true,
          }
        } else {
          return {
            verified: false,
            error: {
              message: 'invalid_signature: The signature does not match any of the issuer signing keys',
              errorCode: 'invalid_signature',
            },
          }
        }
      } catch (e: any) {
        const { message, errorCode } = e
        return {
          verified: false,
          error: {
            message,
            errorCode: errorCode ? errorCode : e.message.split(':')[0],
          },
        }
      }
    } else {
      // JSON-LD
      if (typeof context.agent.verifyPresentationLD === 'function') {
        const result = await context.agent.verifyPresentationLD({ ...args, now: policies?.now })
        return result
      } else {
        throw new Error(
          'invalid_setup: your agent does not seem to have ICredentialIssuerLD plugin installed',
        )
      }
    }
  }

  /**
   * Checks if a key is suitable for signing JWT payloads.
   * @param key - the key to check
   * @param context - the Veramo agent context, unused here
   *
   * @beta
   */
  async matchKeyForJWT(key: IKey, context: IssuerAgentContext): Promise<boolean> {
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

  async listUsableProofFormats(did: IIdentifier, context: IssuerAgentContext): Promise<ProofFormat[]> {
    const signingOptions: ProofFormat[] = []
    const keys = did.keys
    for (const key of keys) {
      if (context.agent.availableMethods().includes('matchKeyForJWT')) {
        if (await context.agent.matchKeyForJWT(key)) {
          signingOptions.push('jwt')
        }
      }
      if (context.agent.availableMethods().includes('matchKeyForLDSuite')) {
        if (await context.agent.matchKeyForLDSuite(key)) {
          signingOptions.push('lds')
        }
      }
      if (context.agent.availableMethods().includes('matchKeyForEIP712')) {
        if (await context.agent.matchKeyForEIP712(key)) {
          signingOptions.push('EthereumEip712Signature2021')
        }
      }
    }
    return signingOptions
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

function wrapSigner(
  context: IAgentContext<Pick<IKeyManager, 'keyManagerSign'>>,
  key: IKey,
  algorithm?: string,
) {
  return async (data: string | Uint8Array): Promise<string> => {
    const result = await context.agent.keyManagerSign({ keyRef: key.kid, data: <string>data, algorithm })
    return result
  }
}

function detectDocumentType(document: W3CVerifiableCredential | W3CVerifiablePresentation): DocumentFormat {
  if (typeof document === 'string' || (<VerifiableCredential>document)?.proof?.jwt) return DocumentFormat.JWT
  if ((<VerifiableCredential>document)?.proof?.type === 'EthereumEip712Signature2021')
    return DocumentFormat.EIP712
  return DocumentFormat.JSONLD
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
