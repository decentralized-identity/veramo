import { ApolloServer } from 'apollo-server'
import program from 'commander'
import { createSchema, supportedMethods } from 'daf-graphql'
import { getAgent } from './setup'

program
  .command('graphql')
  .description('GraphQL server')
  .option('-p, --port <port>', 'Port')
  .action(async (cmd) => {
    const agent = getAgent(program.config)
    const { typeDefs, resolvers } = createSchema({
      enabledMethods: Object.keys(supportedMethods),
    })

    const server = new ApolloServer({
      typeDefs,
      resolvers,
      context: async () => ({ agent: await agent }),
      introspection: true,
    })

    const info = await server.listen({ port: cmd.port })
    console.log(`🚀  Server ready at ${info.url}`)
  })
