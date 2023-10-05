import { IAgentContext, IIdentifier, IKey, IKeyManager, IService, RequireOnly } from '@veramo/core-types'
import { AbstractIdentifierProvider } from '@veramo/did-manager'
import { hexToBytes, bytesToMultibase } from '@veramo/utils'
import { SigningKey } from 'ethers'

import Debug from 'debug'

const debug = Debug('veramo:did-key:identifier-provider')

type IContext = IAgentContext<IKeyManager>
type CreateKeyDidOptions = {
  keyType?: keyof typeof keyCodecs
  privateKeyHex?: string
}

const keyCodecs = {
  Ed25519: 'ed25519-pub',
  X25519: 'x25519-pub',
  Secp256k1: 'secp256k1-pub',
} as const

/**
 * {@link @veramo/did-manager#DIDManager} identifier provider for `did:key` identifiers
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export class KeyDIDProvider extends AbstractIdentifierProvider {
  private defaultKms: string

  constructor(options: { defaultKms: string }) {
    super()
    this.defaultKms = options.defaultKms
  }

  async createIdentifier(
    { kms, options }: { kms?: string; options?: CreateKeyDidOptions },
    context: IContext,
  ): Promise<Omit<IIdentifier, 'provider'>> {
    const keyType = (options?.keyType && keyCodecs[options?.keyType] && options.keyType) || 'Ed25519'
    const key = await this.importOrGenerateKey(
      {
        kms: kms || this.defaultKms,
        options: {
          keyType,
          ...(options?.privateKeyHex && { privateKeyHex: options.privateKeyHex }),
        },
      },
      context,
    )

    const publicKeyHex = key.type === 'Secp256k1' ? SigningKey.computePublicKey('0x' + key.publicKeyHex, true) : key.publicKeyHex
    const methodSpecificId: string = bytesToMultibase(hexToBytes(publicKeyHex), 'base58btc', keyCodecs[keyType])

    const identifier: Omit<IIdentifier, 'provider'> = {
      did: 'did:key:' + methodSpecificId,
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
      kms?: string | undefined
      alias?: string | undefined
      options?: any
    },
    context: IAgentContext<IKeyManager>,
  ): Promise<IIdentifier> {
    throw new Error('KeyDIDProvider updateIdentifier not supported yet.')
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
    throw Error('KeyDIDProvider addKey not supported')
  }

  async addService(
    { identifier, service, options }: { identifier: IIdentifier; service: IService; options?: any },
    context: IContext,
  ): Promise<any> {
    throw Error('KeyDIDProvider addService not supported')
  }

  async removeKey(
    args: { identifier: IIdentifier; kid: string; options?: any },
    context: IContext,
  ): Promise<any> {
    throw Error('KeyDIDProvider removeKey not supported')
  }

  async removeService(
    args: { identifier: IIdentifier; id: string; options?: any },
    context: IContext,
  ): Promise<any> {
    throw Error('KeyDIDProvider removeService not supported')
  }

  private async importOrGenerateKey(
    args: {
      kms: string
      options: RequireOnly<CreateKeyDidOptions, 'keyType'>
    },
    context: IContext,
  ): Promise<IKey> {
    if (args.options.privateKeyHex) {
      return context.agent.keyManagerImport({
        kms: args.kms || this.defaultKms,
        type: args.options.keyType,
        privateKeyHex: args.options.privateKeyHex,
      })
    }
    return context.agent.keyManagerCreate({
      kms: args.kms || this.defaultKms,
      type: args.options.keyType,
    })
  }
}
