import { Jwt, SDJwt, SDJwtInstance } from '@sd-jwt/core'
import { Signer, Verifier } from '@sd-jwt/types'
import { IAgentPlugin, IIdentifier, IKey } from '@veramo/core-types'
import { extractIssuer } from '@veramo/utils'
import schema from '../plugin.schema.json' assert { type: 'json' }
import { SdJWTImplementation } from '../types/ISDJwtPlugin'
import {
  ICreateVerifiableCredentialSDJwtArgs,
  ICreateVerifiableCredentialSDJwtResult,
  ICreateVerifiablePresentationSDJwtArgs,
  ICreateVerifiablePresentationSDJwtResult,
  IRequiredContext,
  ISDJwtPlugin,
  IVerifyVerifiableCredentialSDJwtArgs,
  IVerifyVerifiableCredentialSDJwtResult,
  IVerifyVerifiablePresentationSDJwtArgs,
  IVerifyVerifiablePresentationSDJwtResult,
} from '../types/ISDJwtPlugin.js'

/**
 * SD-JWT plugin for Veramo
 */
export class SDJwtPlugin implements IAgentPlugin {
  readonly schema = schema.ISDJwtPlugin

  constructor(private algorithms: SdJWTImplementation) {}

  // map the methods your plugin is declaring to their implementation
  readonly methods: ISDJwtPlugin = {
    createVerifiableCredentialSDJwt: this.createVerifiableCredentialSDJwt.bind(this),
    createVerifiablePresentationSDJwt: this.createVerifiablePresentationSDJwt.bind(this),
    verifyVerifiableCredentialSDJwt: this.verifyVerifiableCredentialSDJwt.bind(this),
    verifyVerifiablePresentationSDJwt: this.verifyVerifiablePresentationSDJwt.bind(this),
  }

  /**
   * Create a signed SD-JWT credential.
   * @param args - Arguments necessary for the creation of a SD-JWT credential.
   * @param context - This reserved param is automatically added and handled by the framework, *do not override*
   * @returns A signed SD-JWT credential.
   */
  async createVerifiableCredentialSDJwt(
    args: ICreateVerifiableCredentialSDJwtArgs,
    context: IRequiredContext,
  ): Promise<ICreateVerifiableCredentialSDJwtResult> {
    const issuer = extractIssuer(args.credentialPayload, {
      removeParameters: true,
    })
    if (!issuer) {
      throw new Error('invalid_argument: credential.issuer must not be empty')
    }
    if (issuer.split('#').length === 1) {
      throw new Error(
        'invalid_argument: credential.issuer must contain a did id with key reference like did:exmaple.com#key-1',
      )
    }
    const identifier = await context.agent.didManagerGet({
      did: issuer.split('#')[0],
    })
    //TODO: how to make sure it is getting the correct key? Right now it's looping over it, but without checking the key reference.
    const { key, alg } = SDJwtPlugin.getSigningKey(identifier)
    //TODO: let the user also insert a method to sign the data
    const signer: Signer = async (data: string) => context.agent.keyManagerSign({ keyRef: key.kid, data })

    const sdjwt = new SDJwtInstance({
      signer,
      hasher: this.algorithms.hasher,
      saltGenerator: this.algorithms.salltGenerator,
      signAlg: alg,
      hashAlg: 'SHA-256',
    })

    const credential = await sdjwt.issue(args.credentialPayload, args.disclosureFrame)
    return { credential }
  }

  /**
   * Create a signed SD-JWT presentation.
   * @param args - Arguments necessary for the creation of a SD-JWT presentation.
   * @param context - This reserved param is automatically added and handled by the framework, *do not override*
   * @returns A signed SD-JWT presentation.
   */
  async createVerifiablePresentationSDJwt(
    args: ICreateVerifiablePresentationSDJwtArgs,
    context: IRequiredContext,
  ): Promise<ICreateVerifiablePresentationSDJwtResult> {
    const cred = await SDJwt.fromEncode(args.presentation, this.algorithms.hasher)
    //get the key based on the credential
    const identifier = await context.agent.didManagerFind({ alias: 'holder' })
    const { key, alg } = SDJwtPlugin.getSigningKey(identifier[0])

    const signer: Signer = async (data: string) => context.agent.keyManagerSign({ keyRef: key.kid, data })

    const sdjwt = new SDJwtInstance({
      hasher: this.algorithms.hasher,
      saltGenerator: this.algorithms.salltGenerator,
      signAlg: alg,
      signer,
    })
    const credential = await sdjwt.present(args.presentation, args.presentationKeys)
    return { presentation: credential }
  }

  /**
   * Verify a signed SD-JWT credential.
   * @param args
   * @param context
   * @returns
   */
  async verifyVerifiableCredentialSDJwt(
    args: IVerifyVerifiableCredentialSDJwtArgs,
    context: IRequiredContext,
  ): Promise<IVerifyVerifiableCredentialSDJwtResult> {
    // biome-ignore lint/style/useConst: <explanation>
    let sdjwt: SDJwtInstance
    const verifier: Verifier = async (data: string, signature: string) =>
      this.verify(sdjwt, context, data, signature)

    sdjwt = new SDJwtInstance({ verifier, hasher: this.algorithms.hasher })
    const verifiedPayloads = await sdjwt.verify(args.credential)

    return { verifiedPayloads }
  }

  /**
   * Validates the signature of a SD-JWT
   * @param sdjwt
   * @param context
   * @param data
   * @param signature
   * @returns
   */
  async verify(sdjwt: SDJwtInstance, context: IRequiredContext, data: string, signature: string) {
    const decodedVC = await sdjwt.decode(`${data}.${signature}`)
    const issuer: string = ((decodedVC.jwt as Jwt).payload as Record<string, unknown>).issuer as string
    //check if the issuer is a did
    if (!issuer.startsWith('did:')) {
      throw new Error('invalid_issuer: issuer must be a did')
    }
    const didDoc = await context.agent.resolveDid({ didUrl: issuer })
    if (!didDoc) {
      throw new Error('invalid_issuer: issuer did not resolve to a did document')
    }
    const didDocumentKey = didDoc.didDocument?.verificationMethod?.find((key) => key.id)
    if (!didDocumentKey) {
      throw new Error('invalid_issuer: issuer did document does not include referenced key')
    }
    //TODO: in case it's another did method, the value of the key can be also encoded as a base64url
    const key = didDocumentKey.publicKeyJwk as JsonWebKey
    return this.algorithms.verifySignature(data, signature, key)
  }

  /**
   * Verify a signed SD-JWT presentation.
   * @param args
   * @param context
   * @returns
   */
  async verifyVerifiablePresentationSDJwt(
    args: IVerifyVerifiablePresentationSDJwtArgs,
    context: IRequiredContext,
  ): Promise<IVerifyVerifiablePresentationSDJwtResult> {
    // biome-ignore lint/style/useConst: <explanation>
    let sdjwt: SDJwtInstance
    const verifier: Verifier = async (data: string, signature: string) =>
      this.verify(sdjwt, context, data, signature)
    sdjwt = new SDJwtInstance({ verifier, hasher: this.algorithms.hasher })
    const verifiedPayloads = await sdjwt.verify(args.presentation)

    return { verifiedPayloads }
  }

  /**
   * Get the signing key for a given identifier
   * @param identifier
   * @returns
   */
  private static getSigningKey(identifier: IIdentifier): {
    key: IKey
    alg: string
  } {
    for (const key of identifier.keys) {
      if (key.type === 'Ed25519') {
        return { key, alg: 'EdDSA' }
      }
      if (key.type === 'Secp256k1') {
        return { key, alg: 'ES256K' }
      }
      if (key.type === 'Secp256r1') {
        return { key, alg: 'ES256' }
      }
    }

    throw Error(`key_not_found: No signing key for ${identifier.did}`)
  }
}
