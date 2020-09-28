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
      identityManagerGetProviders: [String]
    }
  `,
}

export const identityManagerGetIdentities: IAgentGraphQLMethod = {
  type: 'Query',
  query: `
    query identityManagerGetIdentities($alias: String, $provider: String) {
      identityManagerGetIdentities(alias: $alias, provider: $provider){
        did
        provider
        alias
        controllerKeyId
        keys {
          kid
          kms
          type
          publicKeyHex
        }
        services {
          id
          type
          serviceEndpoint
          description
        }
      }
    } 
  `,
  typeDef: `
    extend type Query {
      identityManagerGetIdentities(alias: String, provider: String): [Identity]
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
        alias
        controllerKeyId
        keys {
          kid
          kms
          type
          publicKeyHex
        }
        services {
          id
          type
          serviceEndpoint
          description
        }
      }
    }
  `,
  typeDef: `
    extend type Query {
      identityManagerGetIdentity(did: String!): Identity!
    }
  `,
}

export const identityManagerGetIdentityByAlias: IAgentGraphQLMethod = {
  type: 'Query',
  query: `
    query identityManagerGetIdentityByAlias($alias: String!, $provider: String) {
      identityManagerGetIdentityByAlias(alias: $alias, provider: $provider) {
        did
        provider
        alias
        controllerKeyId
        keys {
          kid
          kms
          type
          publicKeyHex
        }
        services {
          id
          type
          serviceEndpoint
          description
        }
      }
    }
  `,
  typeDef: `
    extend type Query {
      identityManagerGetIdentityByAlias(alias: String!, provider: String): Identity!
    }
  `,
}

export const identityManagerGetOrCreateIdentity: IAgentGraphQLMethod = {
  type: 'Mutation',
  query: `
    mutation identityManagerGetOrCreateIdentity($alias: String!, $provider: String, $kms: String) {
      identityManagerGetOrCreateIdentity(alias: $alias, provider: $provider, kms: $kms) {
        did
        provider
        alias
        controllerKeyId
        keys {
          kid
          kms
          type
          publicKeyHex
        }
        services {
          id
          type
          serviceEndpoint
          description
        }
      }
    }
  `,
  typeDef: `
    extend type Mutation {
      identityManagerGetOrCreateIdentity(alias: String!, provider: String, kms: String): Identity!
    }
  `,
}

export const identityManagerCreateIdentity: IAgentGraphQLMethod = {
  type: 'Mutation',
  query: `
    mutation identityManagerCreateIdentity($alias: String, $provider: String, $kms: String) {
      identityManagerCreateIdentity(alias: $alias, provider: $provider, kms: $kms) {
        did
        provider
        alias
        controllerKeyId
        keys {
          kid
          kms
          type
          publicKeyHex
        }
        services {
          id
          type
          serviceEndpoint
          description
        }
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

export const identityManagerAddService: IAgentGraphQLMethod = {
  type: 'Mutation',
  query: `
    mutation identityManagerAddService($did: String, $service: ServiceInput) {
      identityManagerAddService(did: $did, service: $service) 
    }
  `,
  typeDef: `
    scalar AddServiceResult
    input ServiceInput {
      id: String!
      type: String!
      serviceEndpoint: String!
      description: String
    }
    extend type Mutation {
      identityManagerAddService(did: String, service: ServiceInput): AddServiceResult
    }
  `,
}

export const supportedMethods: Record<string, IAgentGraphQLMethod> = {
  identityManagerGetProviders,
  identityManagerGetIdentities,
  identityManagerGetIdentity,
  identityManagerGetIdentityByAlias,
  identityManagerCreateIdentity,
  identityManagerGetOrCreateIdentity,
  identityManagerDeleteIdentity,
  identityManagerAddService,
  // TODO identityManagerImportIdentity
}

export default supportedMethods
