/**
 * {@link https://expressjs.com | Express} router for exposing `@veramo/remote-client` OpenAPI schema
 *
 * @example
 * ```typescript
 * import express from 'express'
 * import { agent } from './agent'
 * import { AgentRouter, ApiSchemaRouter, WebDidDocRouter } from '@veramo/remote-server'
 *
 * const getAgentForRequest = async (req: express.Request) => agent
 * const exposedMethods = agent.availableMethods()
 * const basePath = '/agent'
 * const schemaPath = '/open-api.json'
 *
 * const agentRouter = AgentRouter({
 *   getAgentForRequest,
 *   exposedMethods,
 * })
 *
 * const schemaRouter = ApiSchemaRouter({
 *  basePath,
 *  getAgentForRequest,
 *  exposedMethods,
 * })
 *
 * const didDocRouter = WebDidDocRouter({
 *   getAgentForRequest
 * })
 *
 * const app = express()
 * app.use(basePath, agentRouter)
 * app.use(schemaPath, schemaRouter)
 * app.use(didDocRouter)
 * app.listen(3002)
 * ```
 *
 * @packageDocumentation
 */

export { AgentRouter, AgentRouterOptions } from './agent-router.js'
export { ApiSchemaRouter, ApiSchemaRouterOptions } from './api-schema-router.js'
export { WebDidDocRouter, didDocEndpoint } from './web-did-doc-router.js'
export { apiKeyAuth } from './api-key-auth.js'
export { RequestWithAgentRouter } from './request-agent-router.js'
export { MessagingRouter } from './messaging-router.js'
export { createDefaultDid } from './default-did.js'
