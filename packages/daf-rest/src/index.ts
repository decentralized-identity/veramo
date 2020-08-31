/**
 * Provides a {@link daf-rest#AgentRestClient | plugin} for the {@link daf-core#Agent} that can proxy method execution over HTTPS using {@link daf-rest#openApiSchema | OpenAPI}
 *
 * @packageDocumentation
 */
export { AgentRestClient } from './client'
import { openApiSchema } from './openApiSchema'
export { openApiSchema }
export const supportedMethods = Object.keys(openApiSchema.paths).map((path) => path.slice(1))
