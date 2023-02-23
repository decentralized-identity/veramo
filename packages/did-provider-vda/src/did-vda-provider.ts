import { IIdentifier, IKey, IService, IAgentContext, IKeyManager } from '@veramo/core-types'
import { AbstractIdentifierProvider } from '@veramo/did-manager'

import Debug from 'debug'
const debug = Debug('veramo:did-provider-vda')

type IContext = IAgentContext<IKeyManager>

/**
 * {@link @veramo/did-manager#DIDManager} identifier provider for `did:vda` identifiers
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export class DidVdaProvider extends AbstractIdentifierProvider {
  private defaultKms: string
  private endpoints: string[]

  constructor(options: { defaultKms: string; endpoints: string[] }) {
    super()
    this.defaultKms = options.defaultKms
    this.endpoints = options.endpoints
  }

  async createIdentifier(
    { kms, options }: { kms?: string; options?: any },
    context: IContext,
  ): Promise<Omit<IIdentifier, 'provider'>> {
    const key = await context.agent.keyManagerCreate({ kms: kms || this.defaultKms, type: 'Secp256k1' })

    const methodSpecificId = 'not_implemented'

    const identifier: Omit<IIdentifier, 'provider'> = {
      did: 'did:vda:' + methodSpecificId,
      controllerKeyId: key.kid,
      keys: [key],
      services: [],
    }

    debug('Created', identifier.did)
    return identifier
  }

  async updateIdentifier(
    args: { did: string; kms?: string | undefined; alias?: string | undefined; options?: any },
    context: IAgentContext<IKeyManager>,
  ): Promise<IIdentifier> {
    throw new Error('DidVdaProvider updateIdentifier not supported yet.')
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
    throw Error('DidVdaProvider addKey not supported yet.')
  }

  async addService(
    { identifier, service, options }: { identifier: IIdentifier; service: IService; options?: any },
    context: IContext,
  ): Promise<any> {
    throw Error('DidVdaProvider addService not supported yet.')
  }

  async removeKey(
    args: { identifier: IIdentifier; kid: string; options?: any },
    context: IContext,
  ): Promise<any> {
    throw Error('DidVdaProvider removeKey not supported yet.')
  }

  async removeService(
    args: { identifier: IIdentifier; id: string; options?: any },
    context: IContext,
  ): Promise<any> {
    throw Error('DidVdaProvider removeService not supported yet.')
  }
}
