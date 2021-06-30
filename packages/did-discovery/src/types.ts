import {
  IAgentContext,
  IPluginMethodMap,
} from '@veramo/core'

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
  errors?: Record<string, string>
}

export interface IDIDDiscovery extends IPluginMethodMap {
  discoverDid(
    args: IDIDDiscoveryDiscoverDidArgs,
    context: IAgentContext<any>,
  ): Promise<IDIDDiscoveryDiscoverDidResult>
  
}