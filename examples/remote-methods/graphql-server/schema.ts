import { ConfiguredAgent } from './setup'
import gql from 'graphql-tag'

interface Context {
  agent: ConfiguredAgent
}

export const typeDefs = gql`
  # Base typedefs
  type Query

  type Mutation

  type Identity {
    did: String!
    provider: String
  }

  scalar Object
  scalar Date

  # Resolver
  scalar DIDDocument

  extend type Query {
    resolve(did: String!): DIDDocument
  }

  # Identity Manager
  type IdentityProvider {
    type: String!
    description: String
  }
  extend type Query {
    getIdentityProviders: [IdentityProvider]
    getIdentities: [Identity]
    getIdentity(did: String!): Identity
  }

  extend type Mutation {
    createIdentity(type: String): Identity!
    deleteIdentity(type: String, did: String): Boolean!
  }
`

const createAgentResolvers = (methods: string[]) => {
  const resolvers = {}
  for (const method of methods) {
    resolvers[method] = (_: any, args: any, ctx: Context) => ctx.agent.execute(method, args)
  }
  return resolvers
}

export const resolvers = {
  Query: createAgentResolvers(['resolve', 'getIdentities', 'getIdentity', 'getIdentityProviders']),
  Mutation: createAgentResolvers(['createIdentity', 'deleteIdentity']),
}
