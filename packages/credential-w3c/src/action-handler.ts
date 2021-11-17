import {
  IAgentContext,
  IAgentPlugin,
  IResolver,
  IDIDManager,
  IKeyManager,
  IPluginMethodMap,
  IDataStore,
  IKey,
  IIdentifier, VerifiableCredential, VerifiablePresentation, W3CPresentation,
} from '@veramo/core'

import {
  createVerifiableCredentialJwt,
  createVerifiablePresentationJwt,
  CredentialPayload,
  normalizeCredential,
  normalizePresentation,
} from 'did-jwt-vc'

import { LdCredentialModule, schema } from './'
import Debug from 'debug'
import { JWT } from 'did-jwt-vc/lib/types'

const debug = Debug('veramo:w3c:action-handler')

export interface PresentationPayload {
  '@context': string | string[]
  type: string | string[]
  id?: string
  verifiableCredential?: (VerifiableCredential | JWT)[]
  holder: string
  verifier?: string | string[]
  issuanceDate?: string
  expirationDate?: string,

  [x: string]: any
}

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
  presentation: Partial<PresentationPayload>

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
  credential: Partial<CredentialPayload>

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
   * The json payload of the Credential according to the
   * {@link https://www.w3.org/TR/vc-data-model/#credentials | canonical model}
   *
   * The signer of the Credential is chosen based on the `issuer.id` property
   * of the `credential`
   *
   */
  credential: VerifiableCredential
}

/**
 * Encapsulates the parameters required to verify a
 * {@link https://www.w3.org/TR/vc-data-model/#presentations | W3C Verifiable Presentation}
 *
 * @public
 */
export interface IVerifyPresentationArgs {
  /**
   * The json payload of the Credential according to the
   * {@link https://www.w3.org/TR/vc-data-model/#credentials | canonical model}
   *
   * The signer of the Credential is chosen based on the `issuer.id` property
   * of the `credential`
   *
   */
  presentation: VerifiablePresentation

  /**
   * Optional (only for JWT) string challenge parameter to verify the verifiable presentation against
   */
  challenge?: string

  /**
   * Optional (only for JWT) string domain parameter to verify the verifiable presentation against
   */
  domain?: string
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
export type IContext = IAgentContext<IResolver &
  Pick<IDIDManager, 'didManagerGet'> &
  Pick<IDataStore, 'dataStoreSaveVerifiablePresentation' | 'dataStoreSaveVerifiableCredential'> &
  Pick<IKeyManager, 'keyManagerGet' | 'keyManagerSign'>>

/**
 * A Veramo plugin that implements the {@link ICredentialIssuer} methods.
 *
 * @public
 */
export class CredentialIssuer implements IAgentPlugin {
  readonly methods: ICredentialIssuer
  readonly schema = schema.ICredentialIssuer

  private ldCredentialModule: LdCredentialModule
  constructor(options: { ldCredentialModule: LdCredentialModule }) {
    this.ldCredentialModule = options.ldCredentialModule

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
    const presentation: Partial<PresentationPayload> = {
      ...args?.presentation,
      '@context': args?.presentation['@context'] || ['https://www.w3.org/2018/credentials/v1'],
      //FIXME: make sure 'VerifiablePresentation' is the first element in this array:
      type: args?.presentation?.type || ['VerifiablePresentation'],
      issuanceDate: args?.presentation?.issuanceDate || new Date().toISOString(),
    }

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
      //FIXME: `args` should allow picking a key or key type
      const key = identifier.keys.find((k) => k.type === 'Secp256k1' || k.type === 'Ed25519')
      if (!key) throw Error('No signing key for ' + identifier.did)

      //------------------------- BEGIN JSON_LD INSERT
      if (args.proofFormat === 'lds') {
        // LDS ONLY works on `controllerKeyId` because it's uniquely resolvable as a verificationMethod
        if (key.kid != identifier.controllerKeyId) {
          throw new Error('Trying to use a non-controller key for an LD-Proof is not supported')
        }

        const keyPayload = await context.agent.keyManagerGet({ kid: key.kid })
        //issuanceDate must not be present for presentations
        delete presentation.issuanceDate

        return await this.ldCredentialModule.signLDVerifiablePresentation(
          presentation,
          keyPayload,
          args.challenge,
          args.domain,
          identifier,
          context,
        )
      }
      //------------------------- END JSON_LD INSERT
      else {
        // only add issuanceDate for JWT
        presentation.issuanceDate = args.presentation.issuanceDate || new Date().toISOString()
      }

      //FIXME: Throw an `unsupported_format` error if the `args.proofFormat` is not `jwt`
      debug('Signing VP with', identifier.did)
      let alg = 'ES256K'
      if (key.type === 'Ed25519') {
        alg = 'EdDSA'
      }
      const signer = wrapSigner(context, key, alg)

      const jwt = await createVerifiablePresentationJwt(
        presentation as PresentationPayload,
        { did: identifier.did, signer, alg },
        { removeOriginalFields: args.removeOriginalFields },
      )
      //FIXME: flagging this as a potential privacy leak.
      debug(jwt)
      const verifiablePresentation = normalizePresentation(jwt)
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
    const credential: Partial<CredentialPayload> = {
      ...args?.credential,
      '@context': args?.credential?.['@context'] || ['https://www.w3.org/2018/credentials/v1'],
      //FIXME: make sure 'VerifiableCredential' is the first element in this array:
      type: args?.credential?.type || ['VerifiableCredential'],
      issuanceDate: args?.credential?.issuanceDate || new Date().toISOString(),
    }

    //FIXME: if the identifier is not found, the error message should reflect that.
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
      //FIXME: `args` should allow picking a key or key type
      const key = identifier.keys.find((k) => k.type === 'Secp256k1' || k.type === 'Ed25519')
      if (!key) throw Error('No signing key for ' + identifier.did)

      //------------------------- BEGIN JSON_LD INSERT
      let verifiableCredential
      if (args.proofFormat === 'lds') {
        // LDS ONLY works on `controllerKeyId` because it's uniquely resolvable as a verificationMethod
        if (key.kid != identifier.controllerKeyId) {
          throw new Error('Trying to use a non-controller key for an LD-Proof is not supported')
        }

        const keyPayload = await context.agent.keyManagerGet({ kid: key.kid })
        verifiableCredential = await this.ldCredentialModule.issueLDVerifiableCredential(
          credential,
          keyPayload,
          identifier,
          context,
        )
      } else {
        //------------------------- END JSON_LD INSERT
        //FIXME: Throw an `unsupported_format` error if the `args.proofFormat` is not `jwt` or `lds`
        debug('Signing VC with', identifier.did)
        let alg = 'ES256K'
        if (key.type === 'Ed25519') {
          alg = 'EdDSA'
        }
        const signer = wrapSigner(context, key, alg)
        const jwt = await createVerifiableCredentialJwt(
          credential as CredentialPayload,
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
  async verifyCredential(
    args: IVerifyCredentialArgs,
    context: IContext,
  ): Promise<boolean> {
    const credential = args.credential
    // JWT
    if (typeof credential === 'string' || credential.proof.jwt) {
      // Not implemented yet.
      throw Error('verifyCredential currently does not the verification of VC-JWT credentials.')
    }

    return this.ldCredentialModule.verifyCredential(credential, context)
  }

  /** {@inheritdoc ICredentialIssuer.verifyPresentation} */
  async verifyPresentation(
    args: IVerifyPresentationArgs,
    context: IContext,
  ): Promise<boolean> {
    const presentation = args.presentation
    // JWT
    if (typeof presentation === 'string' || (<W3CPresentation>presentation).proof.jwt) {
      // Not implemented yet.
      throw Error('verifyPresentation currently does not the verification of VC-JWT credentials.')
    }

    return this.ldCredentialModule.verifyPresentation(
      presentation,
      args.challenge,
      args.domain,
      context,
    )
  }
}

function wrapSigner(
  context: IAgentContext<Pick<IKeyManager, 'keyManagerSign'>>,
  key: IKey,
  algorithm?: string,
) {
  return async (data: string | Uint8Array) => {
    const result = await context.agent.keyManagerSign({ keyRef: key.kid, data: <string>data, algorithm })
    return result
  }
}
