import { IAgentPlugin, IPluginMethodMap, IAgentPluginSchema } from '@veramo/core'
import { Libp2p } from 'libp2p'
import { createLibp2pNode } from './libp2pNode.js'

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
  readonly methods?: IPluginMethodMap
  readonly schema?: IAgentPluginSchema
  libp2p?: Libp2p = undefined
  constructor(options: {
    schema?: IAgentPluginSchema
  }) {
    this.methods = {
      setupLibp2p: this.setupLibp2p.bind(this)
    }
  }

  setupLibp2p = async () => {
    this.libp2p = await createLibp2pNode()
  }
}

export const createLibp2pClientPlugin = async (): Promise<AgentLibp2pClient> => {
  const plugin = new AgentLibp2pClient({})
  await plugin.setupLibp2p()
  return plugin
}