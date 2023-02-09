import { IAgentContext, IDIDManager } from '@veramo/core-types'
import {
  AbstractDidDiscoveryProvider,
  IDIDDiscoverMatch,
  IDIDDiscoveryProviderResult,
  IDIDDiscoveryDiscoverDidArgs,
} from '@veramo/did-discovery'

/**
 * A DID discovery provider that can filter DIDs by the `alias` used internally in
 * {@link @veramo/did-manager#DIDManager | DIDManager}
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export class AliasDiscoveryProvider implements AbstractDidDiscoveryProvider {
  readonly name = 'alias'

  async discoverDid(
    args: IDIDDiscoveryDiscoverDidArgs,
    context: IAgentContext<IDIDManager>,
  ): Promise<IDIDDiscoveryProviderResult> {
    const matches = []
    try {
      const identifier = await context.agent.didManagerGetByAlias({ alias: args.query })
      const match: IDIDDiscoverMatch = {
        did: identifier.did,
        metaData: {
          alias: identifier.alias,
        },
      }
      matches.push(match)
    } catch (e) {
    }

    return {
      provider: this.name,
      matches,
    }
  }
}
