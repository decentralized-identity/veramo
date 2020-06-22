import { IAgentGraphQLMethod } from '../types'

export const identityManagerGetProviders: IAgentGraphQLMethod = {
  type: 'Query',
  query: `
    query identityManagerGetProviders {
      identityManagerGetProviders
    }
  `,
  typeDef: `
    extend type Query {
      getIdentityProviders: [String]
    }
  `,
}

export const identityManagerGetIdentities: IAgentGraphQLMethod = {
  type: 'Query',
  query: `
    query identityManagerGetIdentities {
      identityManagerGetIdentities{
        did
        provider
      }
    } 
  `,
  typeDef: `
    extend type Query {
      identityManagerGetIdentities: [Identity]
    }
  `,
}

export const identityManagerGetIdentity: IAgentGraphQLMethod = {
  type: 'Query',
  query: `
    query identityManagerGetIdentity($did: String!) {
      identityManagerGetIdentity(did: $did) {
        did
        provider
      }
    }
  `,
  typeDef: `
    extend type Query {
      identityManagerGetIdentity(did: String!): Identity
    }
  `,
}

export const identityManagerCreateIdentity: IAgentGraphQLMethod = {
  type: 'Mutation',
  query: `
    mutation identityManagerCreateIdentity($alias: String, $provider: String, $kms: String) {
      identityManagerCreateIdentity(alias: $alias, provider: $provider, kms: $kms) {
        did
      }
    }
  `,
  typeDef: `
    extend type Mutation {
      identityManagerCreateIdentity(alias: String, provider: String, kms: String): Identity!
    }
  `,
}

export const identityManagerDeleteIdentity: IAgentGraphQLMethod = {
  type: 'Mutation',
  query: `
    mutation identityManagerDeleteIdentity($did: String!) {
      deleteIdentity(did: $did) 
    }
  `,
  typeDef: `
    extend type Mutation {
      identityManagerDeleteIdentity(did: String!): Boolean!
    }
  `,
}

export const supportedMethods: Record<string, IAgentGraphQLMethod> = {
  identityManagerGetProviders,
  identityManagerGetIdentities,
  identityManagerGetIdentity,
  identityManagerCreateIdentity,
  identityManagerDeleteIdentity,
  // TODO identityManagerImportIdentity
}

export default supportedMethods
