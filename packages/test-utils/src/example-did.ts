import {
  IAgentContext,
  IDIDManager,
  IIdentifier,
  IKey,
  IKeyManager,
  IService,
  TAgent,
} from '@veramo/core-types'
import { AbstractIdentifierProvider } from '@veramo/did-manager'
import { _NormalizedVerificationMethod } from '@veramo/utils'
import {
  DIDResolutionOptions,
  DIDResolutionResult,
  DIDResolver,
  ParsedDID,
  Resolvable,
  VerificationMethod,
} from 'did-resolver'

/**
 * A DID method that uses the information stored by the DID manager to resolve
 */
export class ExampleDidProvider extends AbstractIdentifierProvider {
  private defaultKms: string

  constructor({ defaultKms }: { defaultKms: string } = { defaultKms: 'local' }) {
    super()
    this.defaultKms = defaultKms
  }

  async createIdentifier(
    { kms, alias, options }: { kms?: string; alias?: string; options?: any },
    context: IAgentContext<IKeyManager>,
  ): Promise<Omit<IIdentifier, 'provider'>> {
    const key = await context.agent.keyManagerCreate({
      kms: kms || this.defaultKms,
      type: options?.type || 'Secp256k1',
    })

    const identifier: Omit<IIdentifier, 'provider'> = {
      did: 'did:example:' + alias,
      controllerKeyId: key.kid,
      keys: [key],
      services: [],
    }
    return identifier
  }

  async updateIdentifier(args: { did: string; kms?: string | undefined; alias?: string | undefined; options?: any }, context: IAgentContext<IKeyManager>): Promise<IIdentifier> {
    throw new Error('FakeDIDProvider updateIdentifier not supported yet.')
  }

  async deleteIdentifier(identifier: IIdentifier, context: IAgentContext<IKeyManager>): Promise<boolean> {
    for (const { kid } of identifier.keys) {
      await context.agent.keyManagerDelete({ kid })
    }
    return true
  }

  async addKey(
    { identifier, key, options }: { identifier: IIdentifier; key: IKey; options?: any },
    context: IAgentContext<IKeyManager>,
  ): Promise<any> {
    return { success: true }
  }

  async addService(
    { identifier, service, options }: { identifier: IIdentifier; service: IService; options?: any },
    context: IAgentContext<IKeyManager>,
  ): Promise<any> {
    return { success: true }
  }

  async removeKey(
    args: { identifier: IIdentifier; kid: string; options?: any },
    context: IAgentContext<IKeyManager>,
  ): Promise<any> {
    return { success: true }
  }

  async removeService(
    args: { identifier: IIdentifier; id: string; options?: any },
    context: IAgentContext<IKeyManager>,
  ): Promise<any> {
    return { success: true }
  }
}
