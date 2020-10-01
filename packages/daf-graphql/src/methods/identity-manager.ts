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
      identityManagerDeleteIdentity(did: $did) 
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
    mutation identityManagerAddService($did: String!, $service: ServiceInput!, $options: AddServiceOptions) {
      identityManagerAddService(did: $did, service: $service, options: $options) 
    }
  `,
  typeDef: `
    scalar AddServiceResult
    scalar AddServiceOptions
    extend type Mutation {
      identityManagerAddService(did: String, service: ServiceInput, options: AddServiceOptions): AddServiceResult
    }
  `,
}

export const identityManagerRemoveService: IAgentGraphQLMethod = {
  type: 'Mutation',
  query: `
    mutation identityManagerRemoveService($did: String!, $id: String!, $options: RemoveServiceOptions) {
      identityManagerRemoveService(did: $did, id: $id, options: $options) 
    }
  `,
  typeDef: `
  scalar RemoveServiceOptions
  extend type Mutation {
      identityManagerRemoveService(did: String!, id: String!, options: RemoveServiceOptions): Boolean!
    }
  `,
}

export const identityManagerAddKey: IAgentGraphQLMethod = {
  type: 'Mutation',
  query: `
    mutation identityManagerAddKey($did: String!, $key: KeyInput!, $options: AddKeyOptions) {
      identityManagerAddKey(did: $did, key: $key, options: $options) 
    }
  `,
  typeDef: `
    scalar AddKeyResult
    scalar AddKeyOptions
    extend type Mutation {
      identityManagerAddKey(did: String!, key: KeyInput!, options: AddKeyOptions): AddKeyResult
    }
  `,
}

export const identityManagerRemoveKey: IAgentGraphQLMethod = {
  type: 'Mutation',
  query: `
    mutation identityManagerRemoveKey($did: String!, $kid: String!, $options: RemoveKeyOptions) {
      identityManagerRemoveKey(did: $did, kid: $kid, options: $options) 
    }
  `,
  typeDef: `
    scalar RemoveKeyOptions
    extend type Mutation {
      identityManagerRemoveKey(did: String!, kid: String!, options: RemoveKeyOptions): Boolean!
    }
  `,
}

export const identityManagerImportIdentity: IAgentGraphQLMethod = {
  type: 'Mutation',
  query: `
    mutation identityManagerImportIdentity($did: String!, $alias: String, $provider: String!, $controllerKeyId: String, $keys: [KeyInput]!, $services: [ServiceInput]!) {
      identityManagerImportIdentity(did: $did, provider: $provider, alias: $alias, controllerKeyId: $controllerKeyId, keys: $keys, services: $services) {
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
      identityManagerImportIdentity(did: String!, provider: String!, alias: String, controllerKeyId: String, keys: [KeyInput]!, services: [ServiceInput]!): Identity!
    }
  `,
}

export const identityManagerSetAlias: IAgentGraphQLMethod = {
  type: 'Mutation',
  query: `
    mutation identityManagerSetAlias($did: String!, $alias: String!) {
      identityManagerSetAlias(did: $did, alias: $alias) 
    }
  `,
  typeDef: `
    extend type Mutation {
      identityManagerSetAlias(did: String!, alias: String!): Boolean!
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
  identityManagerRemoveService,
  identityManagerAddKey,
  identityManagerRemoveKey,
  identityManagerImportIdentity,
  identityManagerSetAlias,
}

export default supportedMethods
