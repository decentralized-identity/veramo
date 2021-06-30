import { IAgentContext } from '@veramo/core';
import {
  IDIDDiscoveryDiscoverDidArgs,
  IDIDDiscoverMatch
} from './types'

/**
 * An abstract class for the {@link @veramo/did-discovery#DIDDiscovery} providers
 * @public
 */
export abstract class AbstractDidDiscoveryProvider {
  abstract discoverDid(
    args: IDIDDiscoveryDiscoverDidArgs,
    context: IAgentContext<any>,
  ): Promise<Array<IDIDDiscoverMatch>>

}
