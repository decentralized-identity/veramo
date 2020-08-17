export { AgentRestClient } from './client'
import { openApiSchema } from './openApiSchema'
export { openApiSchema }
export const supportedMethods = Object.keys(openApiSchema.paths).map((path) => path.slice(1))
