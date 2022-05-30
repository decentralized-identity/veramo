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

import { schema } from './'
import Debug from 'debug'
import { Resolvable } from 'did-resolver'
import {
  asArray,
  extractIssuer,
  isDefined,
  MANDATORY_CREDENTIAL_CONTEXT,
  processEntryToArray,
} from '@veramo/utils'

const debug = Debug('veramo:w3c:action-handler')

/**
 * The type of encoding to be used for the Verifiable Credential or Presentation to be generated.
 *
 * Only `jwt` and `lds` is supported at the moment.
 *
 * @public
 */
export type ProofFormat = 'jwt' | 'lds'

/**
 * Encapsulates the parameters required to create a
 * {@link https://www.w3.org/TR/vc-data-model/#presentations | W3C Verifiable Presentation}
 *
 * @public
 */
export interface ICreateVerifiablePresentationArgs {
  /**
   * The json payload of the Presentation according to the
   * {@link https://www.w3.org/TR/vc-data-model/#presentations | canonical model}.
   *
   * The signer of the Presentation is chosen based on the `holder` property
   * of the `presentation`
   *
   * '@context', 'type' and 'issuanceDate' will be added automatically if omitted
   */
  presentation: PresentationPayload

  /**
   * If this parameter is true, the resulting VerifiablePresentation is sent to the
   * {@link @veramo/core#IDataStore | storage plugin} to be saved
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
}

/**
 * Encapsulates the parameters required to create a
 * {@link https://www.w3.org/TR/vc-data-model/#credentials | W3C Verifiable Credential}
 *
 * @public
 */
export interface ICreateVerifiableCredentialArgs {
  /**
   * The json payload of the Credential according to the
   * {@link https://www.w3.org/TR/vc-data-model/#credentials | canonical model}
   *
   * The signer of the Credential is chosen based on the `issuer.id` property
   * of the `credential`
   *
   * '@context', 'type' and 'issuanceDate' will be added automatically if omitted
   */
  credential: CredentialPayload

  /**
   * If this parameter is true, the resulting VerifiablePresentation is sent to the
   * {@link @veramo/core#IDataStore | storage plugin} to be saved
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
   * Other options can be specified for verification.
   * They will be forwarded to the lower level modules. that performt the checks
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
   * Set this to `true` ONLY if you want the '@context' URLs to be fetched in case they are not pre-loaded.
   * The context definitions SHOULD rather be provided at startup instead of being fetched.
   *
   * @default false
   */
  fetchRemoteContexts?: boolean

  /**
   * Other options can be specified for verification.
   * They will be forwarded to the lower level modules. that performt the checks
   */
  [x: string]: any
}

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
   * @returns - a promise that resolves to the {@link @veramo/core#VerifiablePresentation} that was requested or rejects with an error
   * if there was a problem with the input or while getting the key to sign
   *
   * @remarks Please see {@link https://www.w3.org/TR/vc-data-model/#presentations | Verifiable Presentation data model }
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
   * @returns - a promise that resolves to the {@link @veramo/core#VerifiableCredential} that was requested or rejects with an error
   * if there was a problem with the input or while getting the key to sign
   *
   * @remarks Please see {@link https://www.w3.org/TR/vc-data-model/#credentials | Verifiable Credential data model}
   */
  createVerifiableCredential(
    args: ICreateVerifiableCredentialArgs,
    context: IContext,
  ): Promise<VerifiableCredential>

  /**
   * Verifies a Verifiable Credential JWT or LDS Format.
   *
   * @param args - Arguments necessary to verify a VerifiableCredential
   * @param context - This reserved param is automatically added and handled by the framework, *do not override*
   *
   * @returns - a promise that resolves to the boolean true on successful verification or rejects on error
   *
   * @remarks Please see {@link https://www.w3.org/TR/vc-data-model/#credentials | Verifiable Credential data model}
   */
  verifyCredential(args: IVerifyCredentialArgs, context: IContext): Promise<boolean>

  /**
   * Verifies a Verifiable Presentation JWT or LDS Format.
   *
   * @param args - Arguments necessary to verify a VerifiableCredential
   * @param context - This reserved param is automatically added and handled by the framework, *do not override*
   *
   * @returns - a promise that resolves to the boolean true on successful verification or rejects on error
   *
   * @remarks Please see {@link https://www.w3.org/TR/vc-data-model/#presentations | Verifiable Credential data model}
   */
  verifyPresentation(args: IVerifyPresentationArgs, context: IContext): Promise<boolean>
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
    const presentationContext = processEntryToArray(
      args?.presentation?.['@context'],
      MANDATORY_CREDENTIAL_CONTEXT,
    )
    const presentationType = processEntryToArray(args?.presentation?.type, 'VerifiablePresentation')
    const presentation: PresentationPayload = {
      ...args?.presentation,
      '@context': presentationContext,
      type: presentationType,
      issuanceDate: args?.presentation?.issuanceDate || new Date(),
    }

    if (!isDefined(presentation.holder)) {
      throw new Error('invalid_argument: args.presentation.holder must not be empty')
    }

    if (args.presentation.verifiableCredential) {
      const credentials = args.presentation.verifiableCredential.map((cred) => {
        // map JWT credentials to their canonical form
        if (typeof cred !== 'string' && cred.proof.jwt) {
          return cred.proof.jwt
        } else {
          return cred
        }
      })
      presentation.verifiableCredential = credentials
    }

    let identifier: IIdentifier
    try {
      identifier = await context.agent.didManagerGet({ did: presentation.holder })
    } catch (e) {
      throw new Error('invalid_argument: args.presentation.holder must be a DID managed by this agent')
    }
    try {
      //FIXME: `args` should allow picking a key or key type
      const key = identifier.keys.find((k) => k.type === 'Secp256k1' || k.type === 'Ed25519')
      if (!key) throw Error('No signing key for ' + identifier.did)

      let verifiablePresentation: VerifiablePresentation

      if (args.proofFormat === 'lds') {
        if (typeof context.agent.createVerifiablePresentationLD === 'function') {
          verifiablePresentation = await context.agent.createVerifiablePresentationLD(args)
        } else {
          throw new Error(
            'invalid_configuration: your agent does not seem to have ICredentialIssuerLD plugin installed',
          )
        }
      } else {
        // only add issuanceDate for JWT
        presentation.issuanceDate = args.presentation.issuanceDate || new Date().toISOString()
        debug('Signing VP with', identifier.did)
        let alg = 'ES256K'
        if (key.type === 'Ed25519') {
          alg = 'EdDSA'
        }
        const signer = wrapSigner(context, key, alg)

        const jwt = await createVerifiablePresentationJwt(
          presentation as any,
          { did: identifier.did, signer, alg },
          { removeOriginalFields: args.removeOriginalFields, challenge: args.challenge, domain: args.domain },
        )
        //FIXME: flagging this as a potential privacy leak.
        debug(jwt)
        verifiablePresentation = normalizePresentation(jwt)
      }
      if (args.save) {
        await context.agent.dataStoreSaveVerifiablePresentation({ verifiablePresentation })
      }
      return verifiablePresentation
    } catch (error) {
      debug(error)
      return Promise.reject(error)
    }
  }

  /** {@inheritdoc ICredentialIssuer.createVerifiableCredential} */
  async createVerifiableCredential(
    args: ICreateVerifiableCredentialArgs,
    context: IContext,
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
      issuanceDate: args?.credential?.issuanceDate || new Date().toISOString(),
    }

    //FIXME: if the identifier is not found, the error message should reflect that.
    const issuer = extractIssuer(credential)
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
      //FIXME: `args` should allow picking a key or key type
      const key = identifier.keys.find((k) => k.type === 'Secp256k1' || k.type === 'Ed25519')
      if (!key) throw Error('No signing key for ' + identifier.did)

      let verifiableCredential: VerifiableCredential
      if (args.proofFormat === 'lds') {
        if (typeof context.agent.createVerifiableCredentialLD === 'function') {
          verifiableCredential = await context.agent.createVerifiableCredentialLD(args as any)
        } else {
          throw new Error(
            'invalid_configuration: your agent does not seem to have ICredentialIssuerLD plugin installed',
          )
        }
      } else {
        debug('Signing VC with', identifier.did)
        let alg = 'ES256K'
        if (key.type === 'Ed25519') {
          alg = 'EdDSA'
        }
        const signer = wrapSigner(context, key, alg)
        const jwt = await createVerifiableCredentialJwt(
          credential as any,
          { did: identifier.did, signer, alg },
          { removeOriginalFields: args.removeOriginalFields },
        )
        //FIXME: flagging this as a potential privacy leak.
        debug(jwt)
        verifiableCredential = normalizeCredential(jwt)
      }
      if (args.save) {
        await context.agent.dataStoreSaveVerifiableCredential({ verifiableCredential })
      }

      return verifiableCredential
    } catch (error) {
      debug(error)
      return Promise.reject(error)
    }
  }

  /** {@inheritdoc ICredentialIssuer.verifyCredential} */
  async verifyCredential(args: IVerifyCredentialArgs, context: IContext): Promise<boolean> {
    const credential = args.credential
    if (typeof credential === 'string' || (<VerifiableCredential>credential)?.proof?.jwt) {
      // JWT
      let jwt: string
      if (typeof credential === 'string') {
        jwt = credential
      } else {
        jwt = credential.proof.jwt
      }
      const resolver = { resolve: (didUrl: string) => context.agent.resolveDid({ didUrl }) } as Resolvable
      try {
        const verification = await verifyCredentialJWT(jwt, resolver)
        return true
      } catch (e: any) {
        //TODO: return a more detailed reason for failure
        return false
      }
    } else {
      // JSON-LD
      if (typeof context.agent.verifyCredentialLD === 'function') {
        const result = await context.agent.verifyCredentialLD(args)
        return result
      } else {
        throw new Error(
          'invalid_configuration: your agent does not seem to have ICredentialIssuerLD plugin installed',
        )
      }
    }
  }

  /** {@inheritdoc ICredentialIssuer.verifyPresentation} */
  async verifyPresentation(args: IVerifyPresentationArgs, context: IContext): Promise<boolean> {
    const presentation = args.presentation
    if (typeof presentation === 'string' || (<VerifiablePresentation>presentation)?.proof?.jwt) {
      // JWT
      let jwt: string
      if (typeof presentation === 'string') {
        jwt = presentation
      } else {
        jwt = presentation.proof.jwt
      }
      const resolver = { resolve: (didUrl: string) => context.agent.resolveDid({ didUrl }) } as Resolvable

      let audience = args.domain
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
        const verification = await verifyPresentationJWT(jwt, resolver, {
          challenge: args.challenge,
          domain: args.domain,
          audience,
        })
        return true
      } catch (e: any) {
        //TODO: return a more detailed reason for failure
        return false
      }
    } else {
      // JSON-LD
      if (typeof context.agent.verifyPresentationLD === 'function') {
        const result = await context.agent.verifyPresentationLD(args)
        return result
      } else {
        throw new Error(
          'invalid_configuration: your agent does not seem to have ICredentialIssuerLD plugin installed',
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
