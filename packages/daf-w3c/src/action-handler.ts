import {
  IAgentContext,
  IAgentPlugin,
  IResolveDid,
  IIdentityManager,
  IKeyManager,
  IPluginMethodMap,
  W3CCredential,
  W3CPresentation,
  VerifiableCredential,
  VerifiablePresentation,
  IDataStore,
} from 'daf-core'

import {
  createVerifiableCredentialJwt,
  createVerifiablePresentationJwt,
  normalizeCredential,
  normalizePresentation,
} from 'did-jwt-vc'

import Debug from 'debug'
const debug = Debug('daf:w3c:action-handler')

/**
 * The type of encoding to be used for the Verifiable Credential or Presentation to be generated.
 *
 * Only `jwt` is supported at the moment.
 *
 * @public
 */
export type EncodingFormat = 'jwt' // | "json" | "json-ld"

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
   */
  presentation: W3CPresentation

  /**
   * If this parameter is true, the resulting VerifiablePresentation is sent to the
   * {@link daf-core#IDataStore | storage plugin} to be saved
   */
  save?: boolean

  /**
   * The desired format for the VerifiablePresentation to be created.
   * Currently, only JWT is supported
   */
  proofFormat: EncodingFormat
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
   */
  credential: W3CCredential

  /**
   * If this parameter is true, the resulting VerifiablePresentation is sent to the
   * {@link daf-core#IDataStore | storage plugin} to be saved
   */
  save?: boolean

  /**
   * The desired format for the VerifiablePresentation to be created.
   * Currently, only JWT is supported
   */
  proofFormat: EncodingFormat
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
   * @returns - a promise that resolves to the {@link daf-core#VerifiablePresentation} that was requested or rejects with an error
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
   * @returns - a promise that resolves to the {@link daf-core#VerifiableCredential} that was requested or rejects with an error
   * if there was a problem with the input or while getting the key to sign
   *
   * @remarks Please see {@link https://www.w3.org/TR/vc-data-model/#credentials | Verifiable Credential data model}
   */
  createVerifiableCredential(
    args: ICreateVerifiableCredentialArgs,
    context: IContext,
  ): Promise<VerifiableCredential>
}

/**
 * Represents the requirements that this plugin has.
 * The agent that is using this plugin is expected to provide these methods.
 *
 * This interface can be used for static type checks, to make sure your application is properly initialized.
 */
export type IContext = IAgentContext<
  IResolveDid &
    Pick<IIdentityManager, 'identityManagerGetIdentity'> &
    Pick<IDataStore, 'dataStoreSaveVerifiablePresentation' | 'dataStoreSaveVerifiableCredential'> &
    Pick<IKeyManager, 'keyManagerSignJWT'>
>

/**
 * A DAF plugin that implements the {@link ICredentialIssuer} methods.
 *
 * @public
 */
export class CredentialIssuer implements IAgentPlugin {
  readonly methods: ICredentialIssuer

  constructor() {
    this.methods = {
      createVerifiablePresentation: this.createVerifiablePresentation,
      createVerifiableCredential: this.createVerifiableCredential,
    }
  }

  /** {@inheritdoc ICredentialIssuer.createVerifiablePresentation} */
  async createVerifiablePresentation(
    args: ICreateVerifiablePresentationArgs,
    context: IContext,
  ): Promise<VerifiablePresentation> {
    try {
      //FIXME: if the identity is not found, the error message should reflect that.
      const identity = await context.agent.identityManagerGetIdentity({ did: args.presentation.holder })
      //FIXME: `args` should allow picking a key or key type
      const key = identity.keys.find((k) => k.type === 'Secp256k1')
      if (!key) throw Error('No signing key for ' + identity.did)
      //FIXME: Throw an `unsupported_format` error if the `args.proofFormat` is not `jwt`
      const signer = (data: string) => context.agent.keyManagerSignJWT({ kid: key.kid, data })
      debug('Signing VP with', identity.did)
      const jwt = await createVerifiablePresentationJwt(args.presentation, { did: identity.did, signer })
      //FIXME: flagging this as a potential privacy leak.
      debug(jwt)
      const presentation = normalizePresentation(jwt)
      if (args.save) {
        await context.agent.dataStoreSaveVerifiablePresentation(presentation)
      }
      return presentation
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
    try {
      //FIXME: if the identity is not found, the error message should reflect that.
      const identity = await context.agent.identityManagerGetIdentity({ did: args.credential.issuer.id })
      //FIXME: `args` should allow picking a key or key type
      const key = identity.keys.find((k) => k.type === 'Secp256k1')
      if (!key) throw Error('No signing key for ' + identity.did)
      //FIXME: Throw an `unsupported_format` error if the `args.proofFormat` is not `jwt`
      const signer = (data: string) => context.agent.keyManagerSignJWT({ kid: key.kid, data })

      debug('Signing VC with', identity.did)
      const jwt = await createVerifiableCredentialJwt(args.credential, { did: identity.did, signer })
      //FIXME: flagging this as a potential privacy leak.
      debug(jwt)
      const credential = normalizeCredential(jwt)
      if (args.save) {
        await context.agent.dataStoreSaveVerifiableCredential(credential)
      }

      return credential
    } catch (error) {
      debug(error)
      return Promise.reject(error)
    }
  }
}
