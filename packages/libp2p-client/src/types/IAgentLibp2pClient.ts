import {
  IAgentContext,
  IDataStore,
  IMessageHandler,
  IPluginMethodMap,
} from '@veramo/core'
import { Multiaddr } from '@multiformats/multiaddr'
import { Libp2p } from 'libp2p'

export type IContext = IAgentContext<IMessageHandler | IDataStore>
/**
 * DID Comm plugin interface for {@link @veramo/core#Agent}
 *
 * @beta This API may change without a BREAKING CHANGE notice.
 */
export interface IAgentLibp2pClient extends IPluginMethodMap {
  

  /**
   *
   * @returns array of Multiaddrs
   *
   * @beta This API may change without a BREAKING CHANGE notice.
   */
  getListenerMultiAddrs(): Promise<Multiaddr[]>

  libp2pShutdown(): Promise<void>

  setupLibp2p(context:IContext, libp2p: Libp2p): Promise<void> 
}
