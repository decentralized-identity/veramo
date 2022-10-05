import { IAgentPlugin, IPluginMethodMap, IAgentPluginSchema, IAgentContext, IDIDManager, IKeyManager } from '@veramo/core'
import { IDIDComm } from '@veramo/did-comm'
import { Libp2p } from 'libp2p'
import { createLibp2pNode } from './libp2pNode.js'
import { DataSource } from 'typeorm'
import { OrPromise } from "@veramo/utils";
import type { PeerId } from '@libp2p/interface-peer-id'
import { pipe } from 'it-pipe'
// import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import * as lp from 'it-length-prefixed'
import map from 'it-map'
import { Uint8ArrayList } from 'uint8arraylist'
import { IAgentLibp2pClient } from './types/IAgentLibp2pClient.js';

type IContext = IAgentContext<IDIDManager & IKeyManager & IDIDComm>

/**
 * The libp2p agent should be provided by {@link @veramo/remote-server#AgentRouter | AgentRouter}, or a similar
 * implementation of this API.
 *
 * The schema of the remote agent is usually provided by {@link @veramo/remote-server#ApiSchemaRouter |
 * ApiSchemaRouter}.
 *
 * @public
 */
class AgentLibp2pClient implements IAgentPlugin {
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

  setupLibp2p = async (context?: IContext) => {
    console.log("setupLibp2p context: ", context)
    try {
      console.log("setupLibp2p 1")
      this.libp2p = await createLibp2pNode(this.peerId)
      console.log("setupLibp2p 2")
      this.libp2p.handle('didcomm/v2', async ({ stream }) => {
        // // Send stdin to the stream
        // stdinToStream(stream)
        // // Read the stream and output to console
        // streamToConsole(stream)
        // console.log("handle stream: ", stream)
        console.log("LIBP2P CLIENT HOLY CRAP")
    
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
            // streamChunkReceivedCb(message)
            console.log("THE CLIENT RECEIVED THE MESSAGE: ", message)
            context?.agent.emit('DIDCommV2Message-received', message)
          }
        )
      })
      console.log("setupLibp2p 3")
      await this.libp2p.start()
      console.log("setupLibp2p 4")
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
  await plugin.setupLibp2p()
  return plugin
}