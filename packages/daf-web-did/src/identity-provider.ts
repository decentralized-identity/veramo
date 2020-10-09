import { IIdentity, IKey, IService, IAgentContext, IKeyManager } from 'daf-core'
import { AbstractIdentityProvider } from 'daf-identity-manager'

import Debug from 'debug'
const debug = Debug('daf:web-did:identity-provider')

type IContext = IAgentContext<IKeyManager>

/**
 * {@link daf-identity-manager#IdentityManager} identity provider for `did:web` identities
 * @public
 */
export class WebIdentityProvider extends AbstractIdentityProvider {
  private defaultKms: string

  constructor(options: { defaultKms: string }) {
    super()
    this.defaultKms = options.defaultKms
  }

  async createIdentity(
    { kms, alias }: { kms?: string; alias?: string },
    context: IContext,
  ): Promise<Omit<IIdentity, 'provider'>> {
    const key = await context.agent.keyManagerCreateKey({ kms: kms || this.defaultKms, type: 'Secp256k1' })

    const identity: Omit<IIdentity, 'provider'> = {
      did: 'did:web:' + alias,
      controllerKeyId: key.kid,
      keys: [key],
      services: [],
    }
    debug('Created', identity.did)
    return identity
  }

  async deleteIdentity(identity: IIdentity, context: IContext): Promise<boolean> {
    for (const { kid } of identity.keys) {
      await context.agent.keyManagerDeleteKey({ kid })
    }
    return true
  }

  async addKey(
    { identity, key, options }: { identity: IIdentity; key: IKey; options?: any },
    context: IContext,
  ): Promise<any> {
    return { success: true }
  }

  async addService(
    { identity, service, options }: { identity: IIdentity; service: IService; options?: any },
    context: IContext,
  ): Promise<any> {
    return { success: true }
  }

  async removeKey(
    args: { identity: IIdentity; kid: string; options?: any },
    context: IContext,
  ): Promise<any> {
    return { success: true }
  }

  async removeService(
    args: { identity: IIdentity; id: string; options?: any },
    context: IContext,
  ): Promise<any> {
    return { success: true }
  }
}
