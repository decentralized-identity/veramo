import { IAgentGraphQLMethod } from './types'
import { supportedMethods } from './methods'
import { baseTypeDef } from './base-type-def'

export const createSchema = (options: {
  enabledMethods: string[]
  overrides?: Record<string, IAgentGraphQLMethod>
}) => {
  let typeDefs = baseTypeDef
  const resolvers: {
    Query: Record<string, (_: any, args: any, ctx: any) => any>
    Mutation: Record<string, (_: any, args: any, ctx: any) => any>
  } = {
    Query: {},
    Mutation: {},
  }

  let allMethods
  if (options.overrides) {
    allMethods = {
      ...supportedMethods,
      ...options.overrides,
    }
  } else {
    allMethods = { ...supportedMethods }
  }

  for (const method of options.enabledMethods) {
    const supportedMethod = allMethods[method]
    if (supportedMethod) {
      resolvers[supportedMethod.type][method] = (_: any, args: any, ctx: any) =>
        ctx.agent.execute(method, args)

      typeDefs += supportedMethod.typeDef
    } else {
      throw Error('[daf:graphql:create-schema] Method not available: ' + method)
    }
  }
  return { resolvers, typeDefs }
}
