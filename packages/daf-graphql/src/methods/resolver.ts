import { IAgentGraphQLMethod } from '../types'

export const resolveDid: IAgentGraphQLMethod = {
  type: 'Query',
  query: `
    query resolveDid($didUrl: String!) {
      resolveDid(didUrl: $didUrl) 
    }
  `,
  typeDef: `
    scalar DIDDocument

    extend type Query {
      resolveDid(didUrl: String!): DIDDocument
    }
  `,
}

export const supportedMethods: Record<string, IAgentGraphQLMethod> = {
  resolveDid,
}

export default supportedMethods
