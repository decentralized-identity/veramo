import { ApolloServer } from 'apollo-server'
import program from 'commander'
import { Gql } from 'daf-core'
import { W3cGql } from 'daf-w3c'
import { TrustGraphGql } from 'daf-trust-graph'
import { DIDCommGql } from 'daf-did-comm'
import { SdrGql } from 'daf-selective-disclosure'
import merge from 'lodash.merge'
import { agent } from './setup'
import { listen } from './services'
import { getConfiguration } from './config'

program
  .command('graphql')
  .description('GraphQL server')
  .option('-p, --port <port>', 'Port')
  .option('-l, --listen', 'Listen for new messages')
  .option('-i, --interval <seconds>', 'Poll for new messages with interval of <seconds>')
  .action(async cmd => {
    await agent
    const { graphql } = getConfiguration()
    const typeDefs = [Gql.baseTypeDefs, Gql.Core.typeDefs]
    let resolvers = Gql.Core.resolvers

    if (graphql.resolvers.IdentityManager) {
      typeDefs.push(Gql.IdentityManager.typeDefs)
      resolvers = merge(resolvers, Gql.IdentityManager.resolvers)
    }

    if (graphql.resolvers.TrustGraph) {
      typeDefs.push(TrustGraphGql.typeDefs)
      resolvers = merge(resolvers, TrustGraphGql.resolvers)
    }

    if (graphql.resolvers.DIDComm) {
      typeDefs.push(DIDCommGql.typeDefs)
      resolvers = merge(resolvers, DIDCommGql.resolvers)
    }

    if (graphql.resolvers.W3c) {
      typeDefs.push(W3cGql.typeDefs)
      resolvers = merge(resolvers, W3cGql.resolvers)
    }

    if (graphql.resolvers.Sdr) {
      typeDefs.push(SdrGql.typeDefs)
      resolvers = merge(resolvers, SdrGql.resolvers)
    }

    const server = new ApolloServer({
      typeDefs,
      resolvers,
      context: async ({ req }) => {
        if (graphql.apiKey) {
          const token = req.headers.authorization || ''
          if (token !== 'Bearer ' + graphql.apiKey) {
            console.log({ token })
            throw Error('Auth error')
          }
        }

        return { agent: await agent }
      },
      introspection: true,
    })
    // await core.setupServices()
    const info = await server.listen({ port: cmd.port })
    console.log(`🚀  Server ready at ${info.url}`)

    if (cmd.listen) {
      await listen(cmd.interval)
    }
  })
