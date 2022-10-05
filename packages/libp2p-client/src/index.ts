/**
 * Provides a {@link @veramo/remote-client#AgentRestClient | plugin} for the {@link @veramo/core#Agent} that
 * can proxy method execution over HTTPS
 *
 * @packageDocumentation
 */
// export { AgentRestClient } from './client.js'
export { createLibp2pNode } from './libp2pNode.js'
export { getOpenApiSchema } from './openApi.js'
export { createLibp2pClientPlugin } from './client.js'
export type { IAgentLibp2pClient } from './types/IAgentLibp2pClient.js'