import { IAgentGraphQLMethod } from '../types'

export const dataStoreORMGetMessages: IAgentGraphQLMethod = {
  type: 'Query',
  query: `
    query dataStoreORMGetMessages($where: [MessagesWhere], $order: [MessagesOrder], $take: Int, $skip: Int) {
      dataStoreORMGetMessages(where: $where, order: $order, take: $take, skip: $skip) {
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
        metaData {
          type
          value
        }
      }
    }
  `,
  typeDef: `
    enum WhereOperation {
      Not
      LessThan
      LessThanOrEqual
      MoreThan
      MoreThanOrEqual
      Equal
      Like
      Between
      In
      Any
      IsNull
    }

    enum OrderDirection {
      ASC
      DESC
    }

    enum MessagesColumns {
      from
      to
      id
      createdAt
      expiresAt
      threadId
      type
      raw
      replyTo
      replyUrl
    }

    input MessagesWhere {
      column: MessagesColumns!
      value: [String]
      not: Boolean
      op: WhereOperation
    }

    input MessagesOrder {
      column: MessagesColumns!
      direction: OrderDirection!
    }

    extend type Query {
      dataStoreORMGetMessages(where: [MessagesWhere], order: [MessagesOrder], take: Int, skip: Int): [Message]
    }
  `,
}

export const dataStoreORMGetVerifiableCredentials: IAgentGraphQLMethod = {
  type: 'Query',
  query: `
    query dataStoreORMGetVerifiableCredentials($where: [CredentialsWhere], $order: [CredentialsOrder], $take: Int, $skip: Int) {
      dataStoreORMGetVerifiableCredentials(where: $where, order: $order, take: $take, skip: $skip) 
    }
  `,
  typeDef: `

    enum CredentialsColumns {
      context
      type
      id
      issuer
      subject
      expirationDate
      issuanceDate
    }

    input CredentialsWhere {
      column: CredentialsColumns!
      value: [String]
      not: Boolean
      op: WhereOperation
    }

    input CredentialsOrder {
      column: CredentialsColumns!
      direction: OrderDirection!
    }

    extend type Query {
      dataStoreORMGetVerifiableCredentials(where: [CredentialsWhere], order: [CredentialsOrder], take: Int, skip: Int): [Credential]
    }
  `,
}

export const dataStoreORMGetIdentities: IAgentGraphQLMethod = {
  type: 'Query',
  query: `
    query dataStoreORMGetIdentities($where: [IdentitiesWhere], $order: [IdentitiesOrder], $take: Int, $skip: Int) {
      dataStoreORMGetIdentities(where: $where, order: $order, take: $take, skip: $skip) {
        did
        provider
        alias
        keys {
          kid
          kms
          type
          publicKeyHex
        }
        services{
          id
          type
          serviceEndpoint
          description
        }
      }
    }
  `,
  typeDef: `

    enum IdentitiesColumns {
      alias
      provider
    }

    input IdentitiesWhere {
      column: IdentitiesColumns!
      value: [String]
      not: Boolean
      op: WhereOperation
    }

    input IdentitiesOrder {
      column: IdentitiesColumns!
      direction: OrderDirection!
    }

    extend type Query {
      dataStoreORMGetIdentities(where: [IdentitiesWhere], order: [IdentitiesOrder], take: Int, skip: Int): [Identity]
    }
  `,
}

export const dataStoreORMGetIdentitiesCount: IAgentGraphQLMethod = {
  type: 'Query',
  query: `
    query dataStoreORMGetIdentitiesCount($where: [IdentitiesWhere], $order: [IdentitiesOrder]) {
      dataStoreORMGetIdentitiesCount(where: $where, order: $order) 
    }
  `,
  typeDef: `
    extend type Query {
      dataStoreORMGetIdentitiesCount(where: [IdentitiesWhere], order: [IdentitiesOrder]): Int
    }
  `,
}

export const supportedMethods: Record<string, IAgentGraphQLMethod> = {
  dataStoreORMGetMessages,
  dataStoreORMGetVerifiableCredentials,
  dataStoreORMGetIdentities,
  dataStoreORMGetIdentitiesCount,
}

export default supportedMethods
