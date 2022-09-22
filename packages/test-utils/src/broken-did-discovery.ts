import { IAgentContext, } from '@veramo/core'
import {
  AbstractDidDiscoveryProvider,
  IDIDDiscoveryDiscoverDidArgs,
  IDIDDiscoveryProviderResult
} from "@veramo/did-discovery";

/**
 * A DID Discovery provider that throws an error for a particular query, used to test error handling.
 */
export class BrokenDiscoveryProvider implements AbstractDidDiscoveryProvider {
  readonly name = 'broken-discovery'

  async discoverDid(
    args: IDIDDiscoveryDiscoverDidArgs,
    context: IAgentContext<any>,
  ): Promise<IDIDDiscoveryProviderResult> {
    if (args.query.match(/broken/)) {
      throw new Error(`test_error: let's see how the plugin handles provider errors`)
    }
    return { matches: [], provider: this.name }
  }
}
