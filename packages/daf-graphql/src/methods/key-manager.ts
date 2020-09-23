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
      keyManagerGetKeyManagementSystems: [String]
    }
  `,
}

export const keyManagerGetKey: IAgentGraphQLMethod = {
  type: 'Query',
  query: `
    query keyManagerGetKey($kid: String) {
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
      keyManagerGetKey(kid: String): Key
    }
  `,
}

export const keyManagerCreateKey: IAgentGraphQLMethod = {
  type: 'Mutation',
  query: `
    mutation keyManagerCreateKey($type: String, $kms: String, $meta: KeyMetaInput) {
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
      keyManagerCreateKey(type: String, kms: String, meta: KeyMetaInput): Key!
    }
  `,
}

export const supportedMethods: Record<string, IAgentGraphQLMethod> = {
  keyManagerGetKeyManagementSystems,
  keyManagerCreateKey,
  keyManagerGetKey,
}

export default supportedMethods
