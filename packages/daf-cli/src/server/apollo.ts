import * as Daf from 'daf-core'
import * as W3c from 'daf-w3c'
import * as DIDComm from 'daf-did-comm'
import { Gql as DataGql } from 'daf-data-store'
import { core, dataStore } from '../setup'
import merge from 'lodash.merge'

const { ApolloServer } = require('apollo-server-express')

const apolloServer = new ApolloServer({
  typeDefs: [
    Daf.Gql.baseTypeDefs,
    Daf.Gql.Core.typeDefs,
    Daf.Gql.IdentityManager.typeDefs,
    DataGql.typeDefs,
    DIDComm.Gql.typeDefs,
    W3c.Gql.typeDefs,
  ],
  resolvers: merge(
    Daf.Gql.Core.resolvers,
    Daf.Gql.IdentityManager.resolvers,
    DataGql.resolvers,
    DIDComm.Gql.resolvers,
    W3c.Gql.resolvers,
  ),
  context: () => ({ dataStore, core }),
  introspection: true,
  graphqlPath: '/graphql',
})

export { core, dataStore, apolloServer }
