interface IAgentGraphQLMethod {
  type: 'Query' | 'Mutation'
  query: string
  typeDef: string
}

export const baseTypeDef = `
type Query
type Mutation

type Identity {
  did: String!
  provider: String
}

scalar Object
scalar Date
`

export const resolve: IAgentGraphQLMethod = {
  type: 'Query',
  query: `
    query resolve($did: String!) {
      resolve(did: $did) 
    }
  `,
  typeDef: `
    scalar DIDDocument

    extend type Query {
      resolve(did: String!): DIDDocument
    }
  `,
}

export const getIdentityProviders: IAgentGraphQLMethod = {
  type: 'Query',
  query: `
    query getIdentityProviders {
      getIdentityProviders {
        type
        description
      }  
    }
  `,
  typeDef: `
    type IdentityProvider {
      type: String!
      description: String
    }
    extend type Query {
      getIdentityProviders: [IdentityProvider]
    }
  `,
}

export const getIdentities: IAgentGraphQLMethod = {
  type: 'Query',
  query: `
    query getIdentities {
      getIdentities{
        did
        provider
      }
    } 
  `,
  typeDef: `
    extend type Query {
      getIdentities: [Identity]
    }
  `,
}

export const getIdentity: IAgentGraphQLMethod = {
  type: 'Query',
  query: `
    query getIdentity($did: String!) {
      getIdentity(did: $did) {
        did
        provider
      }
    }
  `,
  typeDef: `
    extend type Query {
      getIdentity(did: String!): Identity
    }
  `,
}

export const createIdentity: IAgentGraphQLMethod = {
  type: 'Mutation',
  query: `
    mutation createIdentity($type: String) {
      createIdentity(type: $type) {
        did
      }
    }
  `,
  typeDef: `
    extend type Mutation {
      createIdentity(type: String): Identity!
    }
  `,
}

export const deleteIdentity: IAgentGraphQLMethod = {
  type: 'Mutation',
  query: `
    mutation deleteIdentity($did: String!) {
      deleteIdentity(did: $did) 
    }
  `,
  typeDef: `
    extend type Mutation {
      deleteIdentity(type: String, did: String): Boolean!
    }
  `,
}

export const supportedMethods: Record<string, IAgentGraphQLMethod> = {
  resolve,
  getIdentities,
  getIdentity,
  getIdentityProviders,
  createIdentity,
  deleteIdentity,
}
