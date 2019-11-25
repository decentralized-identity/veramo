import { ApolloServer } from 'apollo-server'
import program from 'commander'
import * as Daf from 'daf-core'
import * as W3c from 'daf-w3c'
import * as TG from 'daf-trust-graph'
import { Gql as DataGql } from 'daf-data-store'
import merge from 'lodash.merge'
import { core, dataStore } from './setup'
import { listen } from './services'
program
  .command('graphql')
  .description('GraphQL server')
  .option('-p, --port <port>', 'Port')
  .option('-l, --listen', 'Listen for new messages')
  .action(async cmd => {
    const server = new ApolloServer({
      typeDefs: [
        Daf.Gql.baseTypeDefs,
        Daf.Gql.Core.typeDefs,
        Daf.Gql.IdentityManager.typeDefs,
        DataGql.typeDefs,
        TG.Gql.typeDefs,
        W3c.Gql.typeDefs,
      ],
      resolvers: merge(
        Daf.Gql.Core.resolvers,
        Daf.Gql.IdentityManager.resolvers,
        DataGql.resolvers,
        TG.Gql.resolvers,
        W3c.Gql.resolvers,
      ),
      context: () => ({ dataStore, core }),
      introspection: true,
    })
    const info = await server.listen({ port: cmd.port })
    console.log(`🚀  Server ready at ${info.url}`)

    if (cmd.listen) {
      await listen()
    }
  })
