import { IIdentifier, IKey, IService, IAgentContext, IKeyManager } from '@veramo/core'
import { AbstractIdentifierProvider } from '@veramo/did-manager'

import Debug from 'debug'
const debug = Debug('veramo:ens-did:identifier-provider')

type IContext = IAgentContext<IKeyManager>

/**
 * {@link @veramo/did-manager#DIDManager} identifier provider for `did:ens` identifiers
 * @public
 */
export class EnsDIDProvider extends AbstractIdentifierProvider {
  private defaultKms: string

  constructor(options: { defaultKms: string }) {
    super()
    this.defaultKms = options.defaultKms
  }

  async createIdentifier(
    { kms, alias, options }: { kms?: string; alias?: string; options: any },
    context: IContext,
  ): Promise<Omit<IIdentifier, 'provider'>> {
    const keyType = options?.keyType || 'Secp256k1'
    const key = await context.agent.keyManagerCreate({ kms: kms || this.defaultKms, type: keyType })

    const identifier: Omit<IIdentifier, 'provider'> = {
      did: 'did:ens:' + alias,
      controllerKeyId: key.kid,
      keys: [key],
      services: [],
    }
    debug('Created', identifier.did)
    return identifier
  }

  async updateIdentifier(args: { did: string; kms?: string | undefined; alias?: string | undefined; options?: any }, context: IAgentContext<IKeyManager>): Promise<IIdentifier> {
    throw new Error('EnsDIDProvider updateIdentifier not supported yet.')
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
}
