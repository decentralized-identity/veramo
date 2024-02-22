import { IAgentContext, IIdentifier, IKey, IKeyManager, IService } from '@veramo/core-types'
import { AbstractIdentifierProvider } from '@veramo/did-manager'
import { bytesToBase64url, bytesToMultibase, hexToBytes, stringToUtf8Bytes } from '@veramo/utils'

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

type CreatePeerDidOptions = {
  num_algo: number
  // keyType?: keyof typeof keyCodecs // defaulting to Ed25519 keys only in this implementation
  authPrivateKeyHex?: string
  agreementPrivateKeyHex?: string
  service?: IService
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
    { kms, options }: { kms?: string; options?: CreatePeerDidOptions },
    context: IContext,
  ): Promise<Omit<IIdentifier, 'provider'>> {
    options = options ?? { num_algo: 0 }
    if (options.service) {
      options.num_algo = 2
    }
    if (options.num_algo == 0) {
      let key: IKey
      if (options.authPrivateKeyHex) {
        key = await context.agent.keyManagerImport({
          privateKeyHex: options.authPrivateKeyHex,
          type: 'Ed25519',
          kms: kms ?? this.defaultKms,
        })
      } else {
        key = await context.agent.keyManagerCreate({ kms: kms || this.defaultKms, type: 'Ed25519' })
      }
      const methodSpecificId = bytesToMultibase(hexToBytes(key.publicKeyHex), 'base58btc', 'ed25519-pub')

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
      let authKey: IKey
      let agreementKey: IKey
      if (options.authPrivateKeyHex) {
        authKey = await context.agent.keyManagerImport({
          kms: kms ?? this.defaultKms,
          type: 'Ed25519',
          privateKeyHex: options.authPrivateKeyHex,
        })
      } else {
        authKey = await context.agent.keyManagerCreate({ kms: kms || this.defaultKms, type: 'Ed25519' })
      }
      if (options.agreementPrivateKeyHex) {
        agreementKey = await context.agent.keyManagerImport({
          kms: kms ?? this.defaultKms,
          type: 'X25519',
          privateKeyHex: options.agreementPrivateKeyHex,
        })
      } else {
        agreementKey = await context.agent.keyManagerCreate({
          kms: kms ?? this.defaultKms,
          type: 'X25519',
        })
      }

      const authKeyText = bytesToMultibase(hexToBytes(authKey.publicKeyHex), 'base58btc', 'ed25519-pub')

      const agreementKeyText = bytesToMultibase(
        hexToBytes(agreementKey.publicKeyHex),
        'base58btc',
        'x25519-pub',
      )

      let serviceString = ''

      if (options.service) {
        serviceString = `.S${encodeService(options.service)}`
      }

      const identifier: Omit<IIdentifier, 'provider'> = {
        did: `did:peer:2.E${agreementKeyText}.V${authKeyText}${serviceString}`,
        controllerKeyId: authKey.kid,
        keys: [authKey, agreementKey],
        services: options.service ? [options.service] : [],
      }
      debug('Created', identifier.did)
      return identifier
    } else {
      throw new Error(`'not_supported: PeerDIDProvider num algo ${options.num_algo} not supported yet.'`)
    }
  }

  async updateIdentifier(
    args: { did: string; kms?: string | undefined; alias?: string | undefined; options?: any },
    context: IAgentContext<IKeyManager>,
  ): Promise<IIdentifier> {
    throw new Error('not_supported: PeerDIDProvider updateIdentifier not supported yet.')
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
    throw Error('not_supported: PeerDIDProvider addKey not supported')
  }

  async addService(
    { identifier, service, options }: { identifier: IIdentifier; service: IService; options?: any },
    context: IContext,
  ): Promise<any> {
    throw Error('not_supported: PeerDIDProvider addService not supported')
  }

  async removeKey(
    args: { identifier: IIdentifier; kid: string; options?: any },
    context: IContext,
  ): Promise<any> {
    throw Error('not_supported: PeerDIDProvider removeKey not supported')
  }

  async removeService(
    args: { identifier: IIdentifier; id: string; options?: any },
    context: IContext,
  ): Promise<any> {
    throw Error('not_supported: PeerDIDProvider removeService not supported')
  }
}
