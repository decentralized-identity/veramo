export { GraphQLAgentPlugin } from './plugin'
import { supportedMethods, baseTypeDef } from './methods'
export { supportedMethods, baseTypeDef } from './methods'

export const createSchema = (methods: string[]) => {
  let typeDefs = baseTypeDef
  const resolvers = {
    Query: {},
    Mutation: {},
  }
  for (const method of methods) {
    const supportedMethod = supportedMethods[method]
    if (supportedMethod) {
      resolvers[supportedMethod.type][method] = (_: any, args: any, ctx: any) =>
        ctx.agent.execute(method, args)

      typeDefs += supportedMethod.typeDef
    }
  }
  return { resolvers, typeDefs }
}
