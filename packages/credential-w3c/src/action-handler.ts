import {
  CredentialPayload,
  IAgentContext,
  IAgentPlugin,
  IDataStore,
  IDIDManager,
  IIdentifier,
  IKey,
  IKeyManager,
  IPluginMethodMap,
  IResolver,
  IVerifyResult,
  PresentationPayload,
  VerifiableCredential,
  VerifiablePresentation,
  W3CVerifiableCredential,
  W3CVerifiablePresentation,
} from '@veramo/core'

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
  isDefined,
  MANDATORY_CREDENTIAL_CONTEXT,
  processEntryToArray,
} from '@veramo/utils'
import Debug from 'debug'
import { Resolvable } from 'did-resolver'
import { schema } from './'

const enum DocumentFormat {
  JWT,
  JSONLD,
  EIP712,
}

const debug = Debug('veramo:w3c:action-handler')

/**
 * The type of encoding to be used for the Verifiable Credential or Presentation to be generated.
 *
 * Only `jwt` and `lds` is supported at the moment.
 *
 * @public
 */
export type ProofFormat = 'jwt' | 'lds' | 'EthereumEip712Signature2021'

/**
 * Encapsulates the parameters required to create a
 * {@link https://www.w3.org/TR/vc-data-model/#presentations | W3C Verifiable Presentation}
 *
 * @public
 */
export interface ICreateVerifiablePresentationArgs {
  /**
   * The JSON payload of the Presentation according to the
   * {@link https://www.w3.org/TR/vc-data-model/#presentations | canonical model}.
   *
   * The signer of the Presentation is chosen based on the `holder` property
   * of the `presentation`
   *
   * `@context`, `type` and `issuanceDate` will be added automatically if omitted
   */
  presentation: PresentationPayload

  /**
   * If this parameter is true, the resulting VerifiablePresentation is sent to the
   * {@link @veramo/core#IDataStore | storage plugin} to be saved.
   * <p/><p/>
   * @deprecated Please call
   *   {@link @veramo/core#IDataStore.dataStoreSaveVerifiablePresentation | dataStoreSaveVerifiablePresentation()} to
   *   save the credential after creating it.
   */
  save?: boolean

  /**
   * Optional (only JWT) string challenge parameter to add to the verifiable presentation.
   */
  challenge?: string

  /**
   * Optional string domain parameter to add to the verifiable presentation.
   */
  domain?: string

  /**
   * The desired format for the VerifiablePresentation to be created.
   * Currently, only JWT is supported
   */
  proofFormat: ProofFormat

  /**
   * Remove payload members during JWT-JSON transformation. Defaults to `true`.
   * See https://www.w3.org/TR/vc-data-model/#jwt-encoding
   */
  removeOriginalFields?: boolean

  /**
   * [Optional] The ID of the key that should sign this presentation.
   * If this is not specified, the first matching key will be used.
   */
  keyRef?: string

  /**
   * Any other options that can be forwarded to the lower level libraries
   */
  [x: string]: any
}

/**
 * Encapsulates the parameters required to create a
 * {@link https://www.w3.org/TR/vc-data-model/#credentials | W3C Verifiable Credential}
 *
 * @public
 */
export interface ICreateVerifiableCredentialArgs {
  /**
   * The JSON payload of the Credential according to the
   * {@link https://www.w3.org/TR/vc-data-model/#credentials | canonical model}
   *
   * The signer of the Credential is chosen based on the `issuer.id` property
   * of the `credential`
   *
   * `@context`, `type` and `issuanceDate` will be added automatically if omitted
   */
  credential: CredentialPayload

  /**
   * If this parameter is true, the resulting VerifiablePresentation is sent to the
   * {@link @veramo/core#IDataStore | storage plugin} to be saved.
   *
   * @deprecated Please call
   *   {@link @veramo/core#IDataStore.dataStoreSaveVerifiableCredential | dataStoreSaveVerifiableCredential()} to save
   *   the credential after creating it.
   */
  save?: boolean

  /**
   * The desired format for the VerifiablePresentation to be created.
   */
  proofFormat: ProofFormat

  /**
   * Remove payload members during JWT-JSON transformation. Defaults to `true`.
   * See https://www.w3.org/TR/vc-data-model/#jwt-encoding
   */
  removeOriginalFields?: boolean

  /**
   * [Optional] The ID of the key that should sign this credential.
   * If this is not specified, the first matching key will be used.
   */
  keyRef?: string

  /**
   * Any other options that can be forwarded to the lower level libraries
   */
  [x: string]: any
}

/**
 * Encapsulates the parameters required to verify a
 * {@link https://www.w3.org/TR/vc-data-model/#credentials | W3C Verifiable Credential}
 *
 * @public
 */
export interface IVerifyCredentialArgs {
  /**
   * The Verifiable Credential object according to the
   * {@link https://www.w3.org/TR/vc-data-model/#credentials | canonical model} or the JWT representation.
   *
   * The signer of the Credential is verified based on the `issuer.id` property
   * of the `credential` or the `iss` property of the JWT payload respectively
   *
   */
  credential: W3CVerifiableCredential

  /**
   * When dealing with JSON-LD you also MUST provide the proper contexts.
   * Set this to `true` ONLY if you want the '@context' URLs to be fetched in case they are not pre-loaded.
   * The context definitions SHOULD rather be provided at startup instead of being fetched.
   *
   * @default false
   */
  fetchRemoteContexts?: boolean

  /**
   * Overrides specific aspects of credential verification, where possible.
   */
  policies?: VerificationPolicies

  /**
   * Other options can be specified for verification.
   * They will be forwarded to the lower level modules. that perform the checks
   */
  [x: string]: any
}

/**
 * Encapsulates the parameters required to verify a
 * {@link https://www.w3.org/TR/vc-data-model/#presentations | W3C Verifiable Presentation}
 *
 * @public
 */
export interface IVerifyPresentationArgs {
  /**
   * The Verifiable Presentation object according to the
   * {@link https://www.w3.org/TR/vc-data-model/#presentations | canonical model} or the JWT representation.
   *
   * The signer of the Presentation is verified based on the `holder` property
   * of the `presentation` or the `iss` property of the JWT payload respectively
   *
   */
  presentation: W3CVerifiablePresentation

  /**
   * Optional (only for JWT) string challenge parameter to verify the verifiable presentation against
   */
  challenge?: string

  /**
   * Optional (only for JWT) string domain parameter to verify the verifiable presentation against
   */
  domain?: string

  /**
   * When dealing with JSON-LD you also MUST provide the proper contexts.
   * Set this to `true` ONLY if you want the '@context' URLs to be fetched in case they are not preloaded.
   * The context definitions SHOULD rather be provided at startup instead of being fetched.
   *
   * @default false
   */
  fetchRemoteContexts?: boolean

  /**
   * Overrides specific aspects of credential verification, where possible.
   */
  policies?: VerificationPolicies

  /**
   * Other options can be specified for verification.
   * They will be forwarded to the lower level modules. that perform the checks
   */
  [x: string]: any
}

/**
 * These optional settings can be used to override some default checks that are performed on Presentations during
 * verification.
 *
 * @beta
 */
export interface VerificationPolicies {
  /**
   * policy to over the now (current time) during the verification check (UNIX time in seconds)
   */
  now?: number

  /**
   * policy to skip the issuanceDate (nbf) timestamp check when set to `false`
   */
  issuanceDate?: boolean

  /**
   * policy to skip the expirationDate (exp) timestamp check when set to `false`
   */
  expirationDate?: boolean

  /**
   * policy to skip the audience check when set to `false`
   */
  audience?: boolean

  /**
   * policy to skip the revocation check (credentialStatus) when set to `false`
   */
  credentialStatus?: boolean

  /**
   * Other options can be specified for verification.
   * They will be forwarded to the lower level modules that perform the checks
   */
  [x: string]: any
}

/**
 * Encapsulates the response object to verifyPresentation method after verifying a
 * {@link https://www.w3.org/TR/vc-data-model/#presentations | W3C Verifiable Presentation}
 *
 * @public
 */

/**
 * The interface definition for a plugin that can generate Verifiable Credentials and Presentations
 *
 * @remarks Please see {@link https://www.w3.org/TR/vc-data-model | W3C Verifiable Credentials data model}
 *
 * @public
 */
export interface ICredentialIssuer extends IPluginMethodMap {
  /**
   * Creates a Verifiable Presentation.
   * The payload, signer and format are chosen based on the `args` parameter.
   *
   * @param args - Arguments necessary to create the Presentation.
   * @param context - This reserved param is automatically added and handled by the framework, *do not override*
   *
   * @returns - a promise that resolves to the {@link @veramo/core#VerifiablePresentation} that was requested or
   *   rejects with an error if there was a problem with the input or while getting the key to sign
   *
   * @remarks Please see {@link https://www.w3.org/TR/vc-data-model/#presentations | Verifiable Presentation data model
   *   }
   */
  createVerifiablePresentation(
    args: ICreateVerifiablePresentationArgs,
    context: IContext,
  ): Promise<VerifiablePresentation>

  /**
   * Creates a Verifiable Credential.
   * The payload, signer and format are chosen based on the `args` parameter.
   *
   * @param args - Arguments necessary to create the Presentation.
   * @param context - This reserved param is automatically added and handled by the framework, *do not override*
   *
   * @returns - a promise that resolves to the {@link @veramo/core#VerifiableCredential} that was requested or rejects
   *   with an error if there was a problem with the input or while getting the key to sign
   *
   * @remarks Please see {@link https://www.w3.org/TR/vc-data-model/#credentials | Verifiable Credential data model}
   */
  createVerifiableCredential(
    args: ICreateVerifiableCredentialArgs,
    context: IContext,
  ): Promise<VerifiableCredential>

  /**
   * Verifies a Verifiable Credential JWT, LDS Format or EIP712.
   *
   * @param args - Arguments necessary to verify a VerifiableCredential
   * @param context - This reserved param is automatically added and handled by the framework, *do not override*
   *
   * @returns - a promise that resolves to an object containing a `verified` boolean property and an optional `error`
   *   for details
   *
   * @remarks Please see {@link https://www.w3.org/TR/vc-data-model/#credentials | Verifiable Credential data model}
   */
  verifyCredential(args: IVerifyCredentialArgs, context: IContext): Promise<IVerifyResult>

  /**
   * Verifies a Verifiable Presentation JWT or LDS Format.
   *
   * @param args - Arguments necessary to verify a VerifiableCredential
   * @param context - This reserved param is automatically added and handled by the framework, *do not override*
   *
   * @returns - a promise that resolves to an object containing a `verified` boolean property and an optional `error`
   *   for details
   *
   * @remarks Please see {@link https://www.w3.org/TR/vc-data-model/#presentations | Verifiable Credential data model}
   */
  verifyPresentation(args: IVerifyPresentationArgs, context: IContext): Promise<IVerifyResult>
}

/**
 * Represents the requirements that this plugin has.
 * The agent that is using this plugin is expected to provide these methods.
 *
 * This interface can be used for static type checks, to make sure your application is properly initialized.
 */
export type IContext = IAgentContext<
  IResolver &
    Pick<IDIDManager, 'didManagerGet' | 'didManagerFind'> &
    Pick<IDataStore, 'dataStoreSaveVerifiablePresentation' | 'dataStoreSaveVerifiableCredential'> &
    Pick<IKeyManager, 'keyManagerGet' | 'keyManagerSign'>
>

/**
 * A Veramo plugin that implements the {@link ICredentialIssuer} methods.
 *
 * @public
 */
export class CredentialIssuer implements IAgentPlugin {
  readonly methods: ICredentialIssuer
  readonly schema = schema.ICredentialIssuer

  constructor() {
    this.methods = {
      createVerifiablePresentation: this.createVerifiablePresentation.bind(this),
      createVerifiableCredential: this.createVerifiableCredential.bind(this),
      verifyCredential: this.verifyCredential.bind(this),
      verifyPresentation: this.verifyPresentation.bind(this),
    }
  }

  /** {@inheritdoc ICredentialIssuer.createVerifiablePresentation} */
  async createVerifiablePresentation(
    args: ICreateVerifiablePresentationArgs,
    context: IContext,
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

    let identifier: IIdentifier
    try {
      identifier = await context.agent.didManagerGet({ did: presentation.holder })
    } catch (e) {
      throw new Error('invalid_argument: presentation.holder must be a DID managed by this agent')
    }
    //FIXME: `args` should allow picking a key or key type
    const key = identifier.keys.find((k) => k.type === 'Secp256k1' || k.type === 'Ed25519')
    if (!key) throw Error('key_not_found: No signing key for ' + identifier.did)

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

  /** {@inheritdoc ICredentialIssuer.createVerifiableCredential} */
  async createVerifiableCredential(
    args: ICreateVerifiableCredentialArgs,
    context: IContext,
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
    const issuer = extractIssuer(credential)
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
        //FIXME: `args` should allow picking a key or key type
        const key = identifier.keys.find((k) => k.type === 'Secp256k1' || k.type === 'Ed25519')
        if (!key) throw Error('No signing key for ' + identifier.did)

        debug('Signing VC with', identifier.did)
        let alg = 'ES256K'
        if (key.type === 'Ed25519') {
          alg = 'EdDSA'
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

  /** {@inheritdoc ICredentialIssuer.verifyCredential} */
  async verifyCredential(args: IVerifyCredentialArgs, context: IContext): Promise<IVerifyResult> {
    let { credential, policies, ...otherOptions } = args
    let verifiedCredential: VerifiableCredential
    let verificationResult: IVerifyResult = { verified: false }

    const type: DocumentFormat = detectDocumentType(credential)
    if (type == DocumentFormat.JWT) {
      let jwt: string = typeof credential === 'string' ? credential : credential.proof.jwt

      const resolver = { resolve: (didUrl: string) => context.agent.resolveDid({ didUrl }) } as Resolvable
      try {
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

    if (policies?.credentialStatus !== false && (await isRevoked(verifiedCredential, context))) {
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

  /** {@inheritdoc ICredentialIssuer.verifyPresentation} */
  async verifyPresentation(args: IVerifyPresentationArgs, context: IContext): Promise<IVerifyResult> {
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
      const resolver = { resolve: (didUrl: string) => context.agent.resolveDid({ didUrl }) } as Resolvable

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
          ...otherOptions
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

async function isRevoked(credential: VerifiableCredential, context: IContext): Promise<boolean> {
  if (!credential.credentialStatus) return false

  if (typeof context.agent.checkCredentialStatus === 'function') {
    const status = await context.agent.checkCredentialStatus({ credential })
    return status?.revoked == true || status?.verified === false
  }

  throw new Error(
    `invalid_setup: The credential status can't be verified because there is no ICredentialStatusVerifier plugin installed.`,
  )
}
