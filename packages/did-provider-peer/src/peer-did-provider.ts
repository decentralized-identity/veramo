import { IAgentContext, IIdentifier, IKey, IKeyManager, IService, KeyMetadata, RequireOnly } from '@veramo/core-types'
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
  /**
   * @deprecated use authKey.privateKeyHex instead
   */
  authPrivateKeyHex?: string
  /**
   * @deprecated use agreementKey.privateKeyHex instead
   */
  agreementPrivateKeyHex?: string
  service?: IService

  agreementKey?: {
    privateKeyHex?: string;
    meta?: KeyMetadata
  }

  authKey?: {
    privateKeyHex?: string;
    meta?: KeyMetadata
  }
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

    const authPrivateKeyHex = options?.authKey?.privateKeyHex || options?.authPrivateKeyHex
    const agreementPrivateKeyHex = options?.agreementKey?.privateKeyHex || options?.agreementPrivateKeyHex

    if (options.num_algo == 0) {
      const key = await this.importOrGenerateKey({
        kms: kms || this.defaultKms,
        options: {
          type: 'Ed25519',
          ...(authPrivateKeyHex && { privateKeyHex: authPrivateKeyHex }),
          ...(options?.authKey?.meta && { meta: options.authKey.meta }),
        }
      }, context)

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
      const authKey = await this.importOrGenerateKey({
        kms: kms || this.defaultKms,
        options: {
          type: 'Ed25519',
          ...(authPrivateKeyHex && { privateKeyHex: authPrivateKeyHex }),
          ...(options?.authKey?.meta && { meta: options.authKey.meta }),
        }
      }, context)

      const agreementKey = await this.importOrGenerateKey({
        kms: kms || this.defaultKms,
        options: {
          type: 'X25519',
          ...(agreementPrivateKeyHex && { privateKeyHex: agreementPrivateKeyHex }),
          ...(options?.agreementKey?.meta && { meta: options.agreementKey.meta }),
        }
      }, context)

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

  private async importOrGenerateKey(
    args: {
      kms: string
      options: {
        type: 'Ed25519' | 'X25519';
        privateKeyHex?: string;
        meta?: KeyMetadata
      }
    },
    context: IContext,
  ): Promise<IKey> {
    if (args.options.privateKeyHex) {
      return context.agent.keyManagerImport({
        kms: args.kms || this.defaultKms,
        type: args.options.type,
        privateKeyHex: args.options.privateKeyHex,
        meta: args.options.meta,
      })
    }
    return context.agent.keyManagerCreate({
      kms: args.kms || this.defaultKms,
      type: args.options.type,
      meta: args.options.meta,
    })
  }
}
