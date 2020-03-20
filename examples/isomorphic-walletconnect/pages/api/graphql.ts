import * as Daf from 'daf-core'
import * as DS from 'daf-data-store'
import * as W3c from 'daf-w3c'
import * as SD from 'daf-selective-disclosure'
import * as TG from 'daf-trust-graph'
import { core, dataStore } from '../../daf/setup'

import { ApolloServer } from 'apollo-server-micro'
import merge from 'lodash.merge'

const apolloServer = new ApolloServer({
  typeDefs: [
    Daf.Gql.baseTypeDefs,
    DS.Gql.typeDefs,
    Daf.Gql.Core.typeDefs,
    Daf.Gql.IdentityManager.typeDefs,
    TG.Gql.typeDefs,
    W3c.Gql.typeDefs,
    SD.Gql.typeDefs,
  ],
  resolvers: merge(
    Daf.Gql.Core.resolvers,
    Daf.Gql.IdentityManager.resolvers,
    DS.Gql.resolvers,
    TG.Gql.resolvers,
    W3c.Gql.resolvers,
    SD.Gql.resolvers,
  ),
  context: ({ req }) => {
    // Authorization is out of scope for this example,
    // but this is where you could add your auth logic
    // const token = req.headers.authorization || ''
    // if (token !== 'Bearer hardcoded-example-token') {
    //   throw Error('Auth error')
    // }

    return { core, dataStore }
  },
  introspection: true,
})

const handler = apolloServer.createHandler({ path: '/api/graphql' })

core.on(Daf.EventTypes.validatedMessage, async (message: Daf.Message) => {
  await message.save()
})

export const config = {
  api: {
    bodyParser: false,
  },
}

export default handler
