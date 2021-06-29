import {
  IAgentContext,
  IDIDManager,
  IPluginMethodMap,
} from '@veramo/core'
import { IDataStoreORM } from '@veramo/data-store'

export interface IDIDDiscoveryDiscoverDidArgs {
  query: string
  options?: Record<string, any>
}

export interface IDIDDiscoverMatch {
  did: string
  metaData: Record<string, any>
}

export interface IDIDDiscoveryProviderResult {
  provider: string
  matches: IDIDDiscoverMatch[]
}

export interface IDIDDiscoveryDiscoverDidResult extends Partial<IDIDDiscoveryDiscoverDidArgs> {
  results: IDIDDiscoveryProviderResult[]
}

export interface IDIDDiscovery extends IPluginMethodMap {
  discoverDid(
    args: IDIDDiscoveryDiscoverDidArgs,
    context: IAgentContext<IDIDManager & IDataStoreORM>,
  ): Promise<IDIDDiscoveryDiscoverDidResult>
  
}