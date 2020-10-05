import { IAgentGraphQLMethod } from '../types'

export const dataStoreGetMessage: IAgentGraphQLMethod = {
  type: 'Query',
  query: `
    query dataStoreGetMessage($id: String!) {
      dataStoreGetMessage(id: $id) {
        id
        createdAt
        expiresAt
        threadId
        type
        raw
        data
        replyTo
        replyUrl
        from 
        to 
        presentations
        credentials      
        metaData {
          type
          value
        }
      }
    }
  `,
  typeDef: `
    extend type Query {
      dataStoreGetMessage(id: String!): Message
    }
  `,
}

export const dataStoreSaveMessage: IAgentGraphQLMethod = {
  type: 'Mutation',
  query: `
    mutation dataStoreSaveMessage($message: MessageInput!) {
      dataStoreSaveMessage(message: $message) 
    }
  `,
  typeDef: `
    extend type Mutation {
      dataStoreSaveMessage(message: MessageInput!): String!
    }
  `,
}

export const dataStoreSaveVerifiableCredential: IAgentGraphQLMethod = {
  type: 'Mutation',
  query: `
    mutation dataStoreSaveVerifiableCredential($verifiableCredential: VerifiableCredential!) {
      dataStoreSaveVerifiableCredential(verifiableCredential: $verifiableCredential) 
    }
  `,
  typeDef: `
    extend type Mutation {
      dataStoreSaveVerifiableCredential(verifiableCredential: VerifiableCredential!): String!
    }
  `,
}

export const dataStoreGetVerifiableCredential: IAgentGraphQLMethod = {
  type: 'Query',
  query: `
    query dataStoreGetVerifiableCredential($hash: String!) {
      dataStoreGetVerifiableCredential(hash: $hash) 
    }
  `,
  typeDef: `
    extend type Query {
      dataStoreGetVerifiableCredential(hash: String!): VerifiableCredential
    }
  `,
}

export const dataStoreGetVerifiablePresentation: IAgentGraphQLMethod = {
  type: 'Query',
  query: `
    query dataStoreGetVerifiablePresentation($hash: String!) {
      dataStoreGetVerifiablePresentation(hash: $hash) 
    }
  `,
  typeDef: `
    extend type Query {
      dataStoreGetVerifiablePresentation(hash: String!): VerifiablePresentation
    }
  `,
}

export const dataStoreSaveVerifiablePresentation: IAgentGraphQLMethod = {
  type: 'Mutation',
  query: `
    mutation dataStoreSaveVerifiablePresentation($verifiablePresentation: VerifiablePresentation!) {
      dataStoreSaveVerifiablePresentation(verifiablePresentation: $verifiablePresentation) 
    }
  `,
  typeDef: `
    extend type Mutation {
      dataStoreSaveVerifiablePresentation(verifiablePresentation: VerifiablePresentation!): String!
    }
  `,
}

export const supportedMethods: Record<string, IAgentGraphQLMethod> = {
  dataStoreGetMessage,
  dataStoreSaveMessage,
  dataStoreSaveVerifiableCredential,
  dataStoreGetVerifiableCredential,
  dataStoreGetVerifiablePresentation,
  dataStoreSaveVerifiablePresentation,
}

export default supportedMethods
