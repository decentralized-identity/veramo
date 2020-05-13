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
import { makeExecutableSchema, mergeSchemas } from 'graphql-tools'
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
    const schemas = [
      makeExecutableSchema({
        typeDefs: Gql.baseTypeDefs + Gql.Core.typeDefs,
        resolvers: Gql.Core.resolvers
      })
    ]

    if (graphql.resolvers.IdentityManager) {
      schemas.push(
        makeExecutableSchema({
          typeDefs: Gql.baseTypeDefs + Gql.IdentityManager.typeDefs,
          resolvers: Gql.IdentityManager.resolvers
        })
      )
    }

    if (graphql.resolvers.TrustGraph) {
      schemas.push(
        makeExecutableSchema({
          typeDefs: Gql.baseTypeDefs + TrustGraphGql.typeDefs,
          resolvers: TrustGraphGql.resolvers
        })
      )
    }

    if (graphql.resolvers.DIDComm) {
      schemas.push(
        makeExecutableSchema({
          typeDefs: Gql.baseTypeDefs + DIDCommGql.typeDefs,
          resolvers: DIDCommGql.resolvers
        })
      )
    }

    if (graphql.resolvers.W3c) {
      schemas.push(
        makeExecutableSchema({
          typeDefs: Gql.baseTypeDefs + W3cGql.typeDefs,
          resolvers: W3cGql.resolvers
        })
      )
    }

    if (graphql.resolvers.Sdr) {
      schemas.push(
        makeExecutableSchema({
          typeDefs: Gql.baseTypeDefs + SdrGql.typeDefs,
          resolvers: SdrGql.resolvers
        })
      )
    }

    const schema = mergeSchemas({ schemas })

    const server = new ApolloServer({
      schema,
      context: async ({ req }) => {
        if (graphql.apiKey) {
          const token = req.headers.authorization || ''
          if (token !== 'Bearer ' + graphql.apiKey) {
            throw Error('Auth error')
          }
        }
    
        return { agent: (await agent) }
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
