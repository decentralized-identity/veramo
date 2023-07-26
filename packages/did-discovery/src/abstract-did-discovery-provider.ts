import type { IAgentContext } from '@veramo/core-types'
import type { IDIDDiscoveryDiscoverDidArgs, IDIDDiscoveryProviderResult } from './types.js'

/**
 * An abstract class for the {@link @veramo/did-discovery#DIDDiscovery} providers
 * @public
 */
export abstract class AbstractDidDiscoveryProvider {
  abstract name: string
  abstract discoverDid(
    args: IDIDDiscoveryDiscoverDidArgs,
    context: IAgentContext<any>,
  ): Promise<IDIDDiscoveryProviderResult>
}
