import { IAgentGraphQLMethod } from '../types'

export const keyManagerGetKeyManagementSystems: IAgentGraphQLMethod = {
  type: 'Query',
  query: `
    query keyManagerGetKeyManagementSystems {
      keyManagerGetKeyManagementSystems
    }
  `,
  typeDef: `
    extend type Query {
      keyManagerGetKeyManagementSystems: [String!]
    }
  `,
}

export const keyManagerGetKey: IAgentGraphQLMethod = {
  type: 'Query',
  query: `
    query keyManagerGetKey($kid: String!) {
      keyManagerGetKey(kid: $kid) {
        kid
        kms
        type
        publicKeyHex
        privateKeyHex
        meta
      }
    }
  `,
  typeDef: `
    extend type Query {
      keyManagerGetKey(kid: String!): Key
    }
  `,
}

export const keyManagerCreateKey: IAgentGraphQLMethod = {
  type: 'Mutation',
  query: `
    mutation keyManagerCreateKey($type: String!, $kms: String!, $meta: KeyMetaInput) {
      keyManagerCreateKey(type: $type, kms: $kms, meta: $meta) {
        kid
        kms
        type
        publicKeyHex
        meta
      }
    }
  `,
  typeDef: `
    scalar KeyMetaInput
    extend type Mutation {
      keyManagerCreateKey(type: String!, kms: String!, meta: KeyMetaInput): Key!
    }
  `,
}

export const keyManagerDeleteKey: IAgentGraphQLMethod = {
  type: 'Mutation',
  query: `
    mutation keyManagerDeleteKey($kid: String!) {
      keyManagerDeleteKey(kid: $kid)
    }
  `,
  typeDef: `
    extend type Mutation {
      keyManagerDeleteKey(kid: String!): Boolean!
    }
  `,
}

export const keyManagerImportKey: IAgentGraphQLMethod = {
  type: 'Mutation',
  query: `
    mutation keyManagerImportKey($kid: String!, $type: String!, $kms: String!, $publicKeyHex: String!, $privateKeyHex: String, $meta: KeyMetaInput) {
      keyManagerImportKey(kid: $kid, type: $type, kms: $kms, publicKeyHex: $publicKeyHex, privateKeyHex: $privateKeyHex, meta: $meta) 
    }
  `,
  typeDef: `
    extend type Mutation {
      keyManagerImportKey(kid: String!, type: String!, kms: String!, publicKeyHex: String!, privateKeyHex: String, meta: KeyMetaInput): Boolean!
    }
  `,
}

export const keyManagerSignJWT: IAgentGraphQLMethod = {
  type: 'Mutation',
  query: `
    mutation keyManagerSignJWT($kid: String!, $data: String!) {
      keyManagerSignJWT(kid: $kid, data: $data)
    }
  `,
  typeDef: `
    scalar JWTSignature
    extend type Mutation {
      keyManagerSignJWT(kid: String!, data: String!): JWTSignature!
    }
  `,
}

export const keyManagerSignEthTX: IAgentGraphQLMethod = {
  type: 'Mutation',
  query: `
    mutation keyManagerSignEthTX($kid: String!, $transaction: TransactionInput!) {
      keyManagerSignEthTX(kid: $kid, transaction: $transaction)
    }
  `,
  typeDef: `
    scalar TransactionInput
    extend type Mutation {
      keyManagerSignEthTX(kid: String!, transaction: TransactionInput!): String!
    }
  `,
}

export const supportedMethods: Record<string, IAgentGraphQLMethod> = {
  keyManagerGetKeyManagementSystems,
  keyManagerCreateKey,
  keyManagerGetKey,
  keyManagerDeleteKey,
  keyManagerImportKey,
  keyManagerSignJWT,
  keyManagerSignEthTX,
}

export default supportedMethods
