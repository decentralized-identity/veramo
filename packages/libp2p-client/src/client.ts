import { IAgentPlugin, IPluginMethodMap, IAgentPluginSchema, IAgentContext, IDIDManager, IKeyManager, IMessageHandler } from '@veramo/core'
import { IDIDComm } from '@veramo/did-comm'
import { Libp2p } from 'libp2p'
// import { createBrowserLibp2pNode, createLibp2pNode } from './libp2pNode.js'
import { DataSource } from 'typeorm'
import { OrPromise } from "@veramo/utils";
import type { PeerId } from '@libp2p/interface-peer-id'
import { pipe } from 'it-pipe'
// import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import * as lp from 'it-length-prefixed'
import map from 'it-map'
import { Uint8ArrayList } from 'uint8arraylist'
import { IAgentLibp2pClient, IContext } from './types/IAgentLibp2pClient.js';

// type IContext = IAgentContext<IMessageHandler>

/**
 * The libp2p agent should be provided by {@link @veramo/remote-server#AgentRouter | AgentRouter}, or a similar
 * implementation of this API.
 *
 * The schema of the remote agent is usually provided by {@link @veramo/remote-server#ApiSchemaRouter |
 * ApiSchemaRouter}.
 *
 * @public
 */
export class AgentLibp2pClient implements IAgentPlugin {
  readonly methods?: IAgentLibp2pClient
  libp2p?: Libp2p = undefined
  peerId?: PeerId = undefined
  constructor(options: {
    peerId?: PeerId
  }) {
    this.methods = {
      setupLibp2p: this.setupLibp2p.bind(this),
      getListenerMultiAddrs: this.getListenerMultiAddrs.bind(this),
      libp2pShutdown: this.libp2pShutdown.bind(this)
    }
    this.peerId = options.peerId
  }

  getListenerMultiAddrs = async () => {
    if (!this.libp2p) {
      throw new Error("libp2p not setup")
    }
    return this.libp2p.getMultiaddrs()
  }

  libp2pShutdown = async () => {
    await this.libp2p?.unhandle('didcomm/v2')
    await this.libp2p?.stop()
  }

  public async setupLibp2p(context:IContext, libp2p: Libp2p): Promise<void> {
    try {
      this.libp2p = libp2p
      this.libp2p.handle('didcomm/v2', async ({ stream }) => {
        pipe(
          // Read from the stream (the source)
          stream.source,
          // Decode length-prefixed data
          lp.decode(),
          // Turn buffers into strings
          (source) => map(source, (buf: Uint8ArrayList) => uint8ArrayToString(buf.subarray())),
          // Sink function
          async function (source) {
            // For each chunk of data
            let message = ""
            for await (const msg of source) {
              // console.log("msg of source: ", msg)
              message = message + (msg.toString().replace('\n',''))
            }
            const msg = await context?.agent.handleMessage({ raw: message })
            context?.agent.dataStoreSaveMessage({ message: msg })
          }
        )
      })
      await this.libp2p.start()
    } catch (ex) {
      console.error("some kind of ex: ", ex)
    }
  }
}

export const createLibp2pClientPlugin = async (
  dataSource?: OrPromise<DataSource>, 
  overridePeerId?: PeerId
): Promise<AgentLibp2pClient> => {
  let peerId = overridePeerId
  if (!peerId) {
    // get it from data source, possibly create it
  }
  const plugin = new AgentLibp2pClient({ peerId })
  // await plugin.setupLibp2p()
  return plugin
}