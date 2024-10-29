import { IIdentifier, IKey, IService, IAgentContext, IKeyManager } from '@veramo/core-types'
import { AbstractIdentifierProvider } from '@veramo/did-manager'
import { SupportedKeyTypes, JwkDidSupportedKeyTypes, encodeJoseBlob, importOrCreateKey, generateJwkFromVerificationMethod } from '@veramo/utils'
import { VerificationMethod } from 'did-resolver'
import type { JwkCreateIdentifierOptions } from './types/jwk-provider-types.js'

import Debug from 'debug'
const debug = Debug('veramo:did-jwk:identifier-provider')

type IContext = IAgentContext<IKeyManager>

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
    {
      kms,
      options
    }: {
      kms?: string;
      options?: JwkCreateIdentifierOptions
    },
    context: IContext,
  ): Promise<Omit<IIdentifier, 'provider'>> {
    const keyType: JwkDidSupportedKeyTypes = options?.key?.type || options?.keyType || 'Secp256k1'
    const privateKeyHex = options?.key?.privateKeyHex || options?.privateKeyHex

    let key: IKey

    if (options?.keyRef) {
      key = await context.agent.keyManagerGet({ kid: options.keyRef })

      if (!Object.keys(SupportedKeyTypes).includes(key.type)) {
        throw new Error(`not_supported: Key type ${key.type} is not supported`)
      }
    } else {
      key = await importOrCreateKey(
        {
          kms: kms || this.defaultKms,
          options: {
            ...(options?.key ?? {}),
            type: keyType,
            privateKeyHex,
          },
        },
        context,
      )
    }

    const jwk = generateJwkFromVerificationMethod(
      keyType,
      {
        publicKeyHex: key.publicKeyHex,
      } as VerificationMethod,
      options?.keyUse,
    )
    const jwkBase64url = encodeJoseBlob(jwk as {})

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
    context: IAgentContext<IKeyManager>,
  ): Promise<IIdentifier> {
    throw new Error('not_supported: JwkDIDProvider updateIdentifier not possible')
  }

  async deleteIdentifier(identifier: IIdentifier, context: IContext): Promise<boolean> {
    for (const { kid } of identifier.keys) {
      await context.agent.keyManagerDelete({ kid })
    }
    return true
  }

  async addKey(
    { identifier, key, options }: { identifier: IIdentifier; key: IKey; options?: any },
    context: IContext,
  ): Promise<any> {
    throw Error('not_supported: JwkDIDProvider addKey not possible')
  }

  async addService(
    { identifier, service, options }: { identifier: IIdentifier; service: IService; options?: any },
    context: IContext,
  ): Promise<any> {
    throw Error('not_supported: JwkDIDProvider addService not possible')
  }

  async removeKey(
    args: { identifier: IIdentifier; kid: string; options?: any },
    context: IContext,
  ): Promise<any> {
    throw Error('not_supported: JwkDIDProvider removeKey not possible')
  }

  async removeService(
    args: { identifier: IIdentifier; id: string; options?: any },
    context: IContext,
  ): Promise<any> {
    throw Error('not_supported: JwkDIDProvider removeService not possible')
  }
}
