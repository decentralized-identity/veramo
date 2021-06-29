import {
  IAgentContext,
  IAgentPlugin,
  IDIDManager
} from '@veramo/core'

import {
  IDIDDiscoverMatch,
  IDIDDiscovery,
  IDIDDiscoveryDiscoverDidArgs,
  IDIDDiscoveryProviderResult,
  IDIDDiscoveryDiscoverDidResult
} from './types'
import { schema } from './'
import Debug from 'debug'

/**
 * This class adds support for discovering DIDs.
 */
export class DIDDiscovery implements IAgentPlugin {
  readonly methods: IDIDDiscovery
  readonly schema = schema.IDIDDiscovery

  constructor() {
    this.methods = {
      discoverDid: this.discoverDid,
    }
  }

  /**
   * Queries data providers and returns DIDs with metadata
   *
   * @param args - The param object with the properties necessary to discover DID
   * @param context - *RESERVED* This is filled by the framework when the method is called.
   *
   */
  async discoverDid(
    args: IDIDDiscoveryDiscoverDidArgs,
    context: IAgentContext<IDIDManager>,
  ): Promise<IDIDDiscoveryDiscoverDidResult> {
    return {
      query: '',
      results: []
    }
  }

  
}
