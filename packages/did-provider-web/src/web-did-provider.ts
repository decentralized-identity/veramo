import { RequireOnly, IIdentifier, IKey, IService, IAgentContext, IKeyManager, TKeyType, KeyMetadata } from '@veramo/core-types'
import { AbstractIdentifierProvider } from '@veramo/did-manager'

import Debug from 'debug'
const debug = Debug('veramo:web-did:identifier-provider')

type IContext = IAgentContext<IKeyManager>

type CreateWebDidOptions = {
  /**
   * @deprecated use key.type instead
   */
  keyType?: TKeyType

  /**
   * Metadata passed to the KMS when creating the key
   * Namespaced under key to align with other did provider formats
   */
  key?: {
    type?: TKeyType
    privateKeyHex?: string
    meta?: KeyMetadata
  }
}

/**
 * {@link @veramo/did-manager#DIDManager} identifier provider for `did:web` identifiers
 * @public
 */
export class WebDIDProvider extends AbstractIdentifierProvider {
  private defaultKms: string

  constructor(options: { defaultKms: string }) {
    super()
    this.defaultKms = options.defaultKms
  }

  async createIdentifier(
    { kms, alias, options }: { kms?: string; alias?: string; options: CreateWebDidOptions },
    context: IContext,
  ): Promise<Omit<IIdentifier, 'provider'>> {
    const keyType = options?.key?.type || options?.keyType || 'Secp256k1'
    const privateKeyHex = options?.key?.privateKeyHex

    const key = await this.importOrGenerateKey(
      {
        kms: kms || this.defaultKms,
        options: {
          type: keyType,
          ...(privateKeyHex && { privateKeyHex }),
          ...(options?.key?.meta && { meta: options.key.meta }),
        },
      },
      context,
    )

    const identifier: Omit<IIdentifier, 'provider'> = {
      did: 'did:web:' + alias,
      controllerKeyId: key.kid,
      keys: [key],
      services: [],
    }
    debug('Created', identifier.did)
    return identifier
  }

  async updateIdentifier(args: { did: string; kms?: string | undefined; alias?: string | undefined; options?: any }, context: IAgentContext<IKeyManager>): Promise<IIdentifier> {
    throw new Error('WebDIDProvider updateIdentifier not supported yet.')
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
    return { success: true }
  }

  async addService(
    { identifier, service, options }: { identifier: IIdentifier; service: IService; options?: any },
    context: IContext,
  ): Promise<any> {
    return { success: true }
  }

  async removeKey(
    args: { identifier: IIdentifier; kid: string; options?: any },
    context: IContext,
  ): Promise<any> {
    return { success: true }
  }

  async removeService(
    args: { identifier: IIdentifier; id: string; options?: any },
    context: IContext,
  ): Promise<any> {
    return { success: true }
  }

  private async importOrGenerateKey(
    args: {
      kms: string
      options: RequireOnly<
        RequireOnly<CreateWebDidOptions, 'key'>['key'],
        'type'
      >
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
