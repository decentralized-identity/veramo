import {
  IAgentContext,
  IMessageHandler,
  IPluginMethodMap,
} from '@veramo/core'
import { Multiaddr } from '@multiformats/multiaddr'

export type IContext = IAgentContext<IMessageHandler>
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

  setupLibp2p(context?:IContext): Promise<void>
}
