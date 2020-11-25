/**
 * {@link https://expressjs.com | Express} router for exposing `daf-rest` OpenAPI schema
 *
 * @example
 * ```typescript
 * import express from 'express'
 * import { agent } from './agent'
 * import { AgentRouter, ApiSchemaRouter, DidDocRouter } from 'daf-express'
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
 * const didDocRouter = DidDocRouter({
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

export { AgentRouter, AgentRouterOptions } from './agent-router'
export { ApiSchemaRouter, ApiSchemaRouterOptions } from './api-schema-router'
export { DidDocRouter, DidDocRouterOptions, didDocEndpoint } from './did-doc-router'
