import { IIdentifier, IKey, IService, IAgentContext, IKeyManager } from '@veramo/core-types'
import { AbstractIdentifierProvider } from '@veramo/did-manager'
import { VerificationMethod } from 'did-resolver'
import type { JwkDidSupportedKeyTypes } from '.'
import { generateJWKfromVerificationMethod } from './jwkDidUtils.js'

import Debug from 'debug'
const debug = Debug('veramo:did-jwk:identifier-provider')

type IContext = IAgentContext<IKeyManager>;


/**
 * {@link @veramo/did-manager#DIDManager} identifier provider for `did:jwk` identifiers
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export class JwkDIDProvider extends AbstractIdentifierProvider {
  private defaultKms: string

  constructor(options: { defaultKms: string }) {
    super()
    this.defaultKms = options.defaultKms
  }

  async createIdentifier(
    { kms, options }: { kms?: string; options?: any },
    context: IContext
  ): Promise<Omit<IIdentifier, 'provider'>> {
    const keyType: JwkDidSupportedKeyTypes = options?.keyType || 'Secp256k1'
    const key = await context.agent.keyManagerCreate({
      kms: kms || this.defaultKms,
      type: keyType,
    })

    const jwk = generateJWKfromVerificationMethod(
      keyType, 
      { publicKeyHex: key.publicKeyHex } as VerificationMethod
    )
    const jwkBase64url = Buffer.from(JSON.stringify(jwk)).toString('base64url')

    const identifier: Omit<IIdentifier, 'provider'> = {
      did: `did:jwk:${jwkBase64url}`,
      controllerKeyId: key.kid,
      keys: [key],
      services: [],
    }
    debug('Created', identifier.did)
    return identifier
  }

  async updateIdentifier(
    args: {
      did: string
      kms?: string
      alias?: string
      options?: any
    },
    context: IAgentContext<IKeyManager>
  ): Promise<IIdentifier> {
    throw new Error('not_supported: JwkDIDProvider updateIdentifier not possible')
  }

  async deleteIdentifier(
    identifier: IIdentifier,
    context: IContext
  ): Promise<boolean> {
    for (const { kid } of identifier.keys) {
      await context.agent.keyManagerDelete({ kid })
    }
    return true
  }

  async addKey({
      identifier,
      key,
      options,
    }: { identifier: IIdentifier; key: IKey; options?: any },
    context: IContext
  ): Promise<any> {
    throw Error('not_supported: JwkDIDProvider addKey not possible')
  }

  async addService({
      identifier,
      service,
      options,
    }: { identifier: IIdentifier; service: IService; options?: any },
    context: IContext
  ): Promise<any> {
    throw Error('not_supported: JwkDIDProvider addService not possible')
  }

  async removeKey(
    args: { identifier: IIdentifier; kid: string; options?: any },
    context: IContext
  ): Promise<any> {
    throw Error('not_supported: JwkDIDProvider removeKey not possible')

  }

  async removeService(
    args: { identifier: IIdentifier; id: string; options?: any },
    context: IContext
  ): Promise<any> {
    throw Error('JwkDIDProvider removeService not supported')
  }
}
