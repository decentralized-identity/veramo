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

import { LdContextLoader, LdCredentialModule, LdSuiteLoader, schema, VeramoLdSignature } from './'
import Debug from 'debug'
import { ContextDoc, OrPromise, RecordLike } from "./ld-context-loader";

const debug = Debug('veramo:w3c:action-handler')

export type JWT = string
export type IssuerType = { id: string, [x: string]: any } | string
export type CredentialSubject = { id?: string, [x: string]: any }

export interface CredentialStatus {
  id: string
  type: string

  [x: string]: any
}

export type DateType = string | Date

/**
 * used as input when creating Verifiable Credentials
 */
export interface CredentialPayload {
  '@context': string | string[]
  id?: string
  type: string | string[]
  issuer: IssuerType
  issuanceDate: DateType
  expirationDate?: DateType
  credentialSubject: CredentialSubject
  credentialStatus?: CredentialStatus

  [x: string]: any
}

/**
 * used as input when creating Verifiable Presentations
 */
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
 * The interface definition for a plugin that can issue and verify Verifiable Credentials and Presentations
 * that use JSON-LD format.
 *
 * @remarks Please see {@link https://www.w3.org/TR/vc-data-model | W3C Verifiable Credentials data model}
 *
 * @public
 */
export interface ICredentialIssuerLD extends IPluginMethodMap {
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
  createVerifiablePresentationLD(
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
  createVerifiableCredentialLD(
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
  verifyCredentialLD(args: IVerifyCredentialArgs, context: IContext): Promise<boolean>

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
  verifyPresentationLD(args: IVerifyPresentationArgs, context: IContext): Promise<boolean>
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
  async createVerifiablePresentationLD(
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

      // LDS ONLY works on `controllerKeyId` because it's uniquely resolvable as a verificationMethod
      if (key.kid != identifier.controllerKeyId) {
        throw new Error('Trying to use a non-controller key for an LD-Proof is not supported')
      }

      const keyPayload = await context.agent.keyManagerGet({ kid: key.kid })
      //issuanceDate must not be present for presentations because it is not defined in a @context
      delete presentation.issuanceDate

      return await this.ldCredentialModule.signLDVerifiablePresentation(
        presentation,
        keyPayload,
        args.challenge,
        args.domain,
        identifier,
        context,
      )
    } catch (error) {
      debug(error)
      return Promise.reject(error)
    }
  }

  /** {@inheritdoc ICredentialIssuerLD.createVerifiableCredentialLD} */
  async createVerifiableCredentialLD(
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

      return verifiableCredential
    } catch (error) {
      debug(error)
      return Promise.reject(error)
    }
  }

  /** {@inheritdoc ICredentialIssuerLD.verifyCredentialLD} */
  async verifyCredentialLD(
    args: IVerifyCredentialArgs,
    context: IContext,
  ): Promise<boolean> {
    const credential = args.credential
    return this.ldCredentialModule.verifyCredential(credential, context)
  }

  /** {@inheritdoc ICredentialIssuerLD.verifyPresentationLD} */
  async verifyPresentationLD(
    args: IVerifyPresentationArgs,
    context: IContext,
  ): Promise<boolean> {
    const presentation = args.presentation
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
