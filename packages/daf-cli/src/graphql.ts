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
program
  .command('graphql')
  .description('GraphQL server')
  .option('-p, --port <port>', 'Port')
  .option('-l, --listen', 'Listen for new messages')
  .option('-i, --interval <seconds>', 'Poll for new messages with interval of <seconds>')
  .action(async cmd => {
    const server = new ApolloServer({
      typeDefs: [
        Gql.baseTypeDefs,
        Gql.Core.typeDefs,
        Gql.IdentityManager.typeDefs,
        TrustGraphGql.typeDefs,
        DIDCommGql.typeDefs,
        W3cGql.typeDefs,
        SdrGql.typeDefs,
      ],
      resolvers: merge(
        Gql.Core.resolvers,
        Gql.IdentityManager.resolvers,
        TrustGraphGql.resolvers,
        DIDCommGql.resolvers,
        W3cGql.resolvers,
        SdrGql.resolvers,
      ),
      context: async () => ({ agent: (await agent) }),
      introspection: true,
    })
    // await core.setupServices()
    const info = await server.listen({ port: cmd.port })
    console.log(`🚀  Server ready at ${info.url}`)

    if (cmd.listen) {
      await listen(cmd.interval)
    }
  })
