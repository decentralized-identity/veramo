import { IAgentContext, IIdentifier, IKey, IKeyManager, IService } from '@veramo/core-types'
import { AbstractIdentifierProvider } from '@veramo/did-manager'
import { base58btc } from 'multiformats/bases/base58'
import Multicodec from 'multicodec'
import { bytesToBase64url, hexToBytes, stringToUtf8Bytes } from '@veramo/utils'

import Debug from 'debug'

const debug = Debug('veramo:did-peer:identifier-provider')

type IContext = IAgentContext<IKeyManager>

const ServiceReplacements = {
  type: 't',
  DIDCommMessaging: 'dm',
  serviceEndpoint: 's',
  routingKeys: 'r',
  accept: 'a',
}

const encodeService = (service: IService): string => {
  let encoded = JSON.stringify(service)
  Object.values(ServiceReplacements).forEach((v: string, idx: number) => {
    encoded = encoded.replace(Object.keys(ServiceReplacements)[idx], v)
  })
  return bytesToBase64url(stringToUtf8Bytes(encoded))
}

/**
 * {@link @veramo/did-manager#DIDManager} identifier provider for `did:key` identifiers
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export class PeerDIDProvider extends AbstractIdentifierProvider {
  private defaultKms: string

  constructor(options: { defaultKms: string }) {
    super()
    this.defaultKms = options.defaultKms
  }

  async createIdentifier(
    { kms, options }: { kms?: string; options?: any },
    context: IContext,
  ): Promise<Omit<IIdentifier, 'provider'>> {
    if (options.num_algo == 0) {
      const key = await context.agent.keyManagerCreate({ kms: kms || this.defaultKms, type: 'Ed25519' })
      const methodSpecificId = base58btc.encode(
        Multicodec.addPrefix('ed25519-pub', hexToBytes(key.publicKeyHex)),
      )

      const identifier: Omit<IIdentifier, 'provider'> = {
        did: 'did:peer:0' + methodSpecificId,
        controllerKeyId: key.kid,
        keys: [key],
        services: [],
      }
      debug('Created', identifier.did)
      return identifier
    } else if (options.num_algo == 1) {
      throw new Error(`'PeerDIDProvider num algo ${options.num_algo} not supported yet.'`)
    } else if (options.num_algo == 2) {
      const authKey = await context.agent.keyManagerCreate({ kms: kms || this.defaultKms, type: 'Ed25519' })

      const agreementKey = await context.agent.keyManagerCreate({
        kms: kms || this.defaultKms,
        type: 'X25519',
      })

      const authKeyText = base58btc.encode(
        Multicodec.addPrefix('ed25519-pub', hexToBytes(authKey.publicKeyHex)),
      )

      const agreementKeyText = base58btc.encode(
        Multicodec.addPrefix('x25519-pub', hexToBytes(agreementKey.publicKeyHex)),
      )

      const ServiceEncoded = encodeService(options.service)

      const identifier: Omit<IIdentifier, 'provider'> = {
        did: `did:peer:2.E${agreementKeyText}.V${authKeyText}.S${ServiceEncoded}`,
        controllerKeyId: authKey.kid,
        keys: [authKey, agreementKey],
        services: [options.service],
      }
      debug('Created', identifier.did)
      return identifier
    } else {
      throw new Error(`'PeerDIDProvider num algo ${options.num_algo} not supported yet.'`)
    }
  }

  async updateIdentifier(
    args: { did: string; kms?: string | undefined; alias?: string | undefined; options?: any },
    context: IAgentContext<IKeyManager>,
  ): Promise<IIdentifier> {
    throw new Error('PeerDIDProvider updateIdentifier not supported yet.')
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
    throw Error('PeerDIDProvider addKey not supported')
  }

  async addService(
    { identifier, service, options }: { identifier: IIdentifier; service: IService; options?: any },
    context: IContext,
  ): Promise<any> {
    throw Error('PeerDIDProvider addService not supported')
  }

  async removeKey(
    args: { identifier: IIdentifier; kid: string; options?: any },
    context: IContext,
  ): Promise<any> {
    throw Error('PeerDIDProvider removeKey not supported')
  }

  async removeService(
    args: { identifier: IIdentifier; id: string; options?: any },
    context: IContext,
  ): Promise<any> {
    throw Error('PeerDIDProvider removeService not supported')
  }
}
