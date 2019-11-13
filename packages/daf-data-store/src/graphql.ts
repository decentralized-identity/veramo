import { DataStore } from './data-store'

interface Context {
  dataStore: DataStore
}

export const resolvers = {
  Message: {
    vc: async (message: any, {}, { dataStore }: Context) =>
      dataStore.credentialsForMessageHash(message.hash),
  },
  VerifiableClaim: {
    fields: async (vc: any, {}, { dataStore }: Context) =>
      dataStore.credentialsFieldsForClaimHash(vc.hash),
  },
  Identity: {
    shortId: async (identity: any, {}, { dataStore }: Context) =>
      dataStore.shortId(identity.did),
    firstName: async (identity: any, {}, { dataStore }: Context) =>
      dataStore.popularClaimForDid(identity.did, 'firstName'),
    lastName: async (identity: any, {}, { dataStore }: Context) =>
      dataStore.popularClaimForDid(identity.did, 'lastName'),
    profileImage: async (identity: any, {}, { dataStore }: Context) => {
      let url = await dataStore.popularClaimForDid(identity.did, 'profileImage')
      if (url) {
        try {
          const ipfs = JSON.parse(url)
          if (ipfs['/']) {
            url = 'https://cloudflare-ipfs.com' + ipfs['/']
          }
        } catch (e) {
          // do nothing
        }
      }
      return typeof url === 'string' ? url : ''
    },
    url: async (identity: any, {}, { dataStore }: Context) =>
      dataStore.popularClaimForDid(identity.did, 'url'),
    description: async (identity: any, {}, { dataStore }: Context) =>
      dataStore.popularClaimForDid(identity.did, 'description'),
    interactionCount: async (
      identity: any,
      { did }: { did: string },
      { dataStore }: Context,
    ) => dataStore.interactionCount(identity.did, did),
    credentialsIssued: async (
      identity: any,
      args: any,
      { dataStore }: Context,
    ) => {
      return dataStore.findCredentials({ iss: identity.did })
    },
    credentialsReceived: async (
      identity: any,
      args: any,
      { dataStore }: Context,
    ) => {
      return dataStore.findCredentials({ sub: identity.did })
    },
    credentialsAll: async (
      identity: any,
      args: any,
      { dataStore }: Context,
    ) => {
      return dataStore.findCredentials({ iss: identity.did, sub: identity.did })
    },
    messagesSent: async (identity: any, args: any, { dataStore }: Context) => {
      return dataStore.findMessages({ iss: identity.did })
    },
    messagesReceived: async (
      identity: any,
      args: any,
      { dataStore }: Context,
    ) => {
      return dataStore.findMessages({ sub: identity.did })
    },
    messagesAll: async (identity: any, args: any, { dataStore }: Context) => {
      return dataStore.findMessages({ iss: identity.did, sub: identity.did })
    },
  },
  Query: {
    identity: async (
      _: any,
      { did }: { did: string },
      { dataStore }: Context,
    ) => dataStore.findIdentityByDid(did),
    identities: async (
      _: any,
      { dids }: { dids: string[] },
      { dataStore }: Context,
    ) => {
      return dids ? dids.map(did => ({ did })) : dataStore.allIdentities()
    },
    messages: async (
      _: any,
      {
        iss,
        sub,
        tag,
        limit,
      }: { iss: string; sub: string; tag: string; limit: number },
      { dataStore }: Context,
    ) => {
      return dataStore.findMessages({ iss, sub, tag, limit })
    },
    message: async (
      _: any,
      { hash }: { hash: string },
      { dataStore }: Context,
    ) => dataStore.findMessage(hash),
    credentials: async (
      _: any,
      { iss, sub }: { iss: string; sub: string },
      { dataStore }: Context,
    ) => {
      const res = await dataStore.findCredentials({ iss, sub })
      return res
    },
  },
  Mutation: {
    deleteMessage: async (
      _: any,
      { hash }: { hash: string },
      { dataStore }: Context,
    ) => dataStore.deleteMessage(hash),
  },
}

export const typeDefs = `
  extend type Query {
    identity(did: ID!): Identity
    identities(dids: [ID!]): [Identity]
    messages(iss: ID, sub: ID, tag: String, limit: Int): [Message]
    message(hash: ID!): Message!
    credentials(iss: ID, sub: ID): [VerifiableClaim]
  }

  extend type Mutation {
    deleteMessage(hash: ID!): Boolean
  }

  extend type Identity {
    shortId: String
    firstName: String
    lastName: String
    profileImage: String
    url: String
    description: String
    interactionCount: Int!
    messagesSent: [Message]
    messagesReceived: [Message]
    messagesAll: [Message]
    credentialsIssued: [VerifiableClaim]
    credentialsReceived: [VerifiableClaim]
    credentialsAll: [VerifiableClaim]
  }
  
  extend type Message {
    iss: Identity!
    sub: Identity
    aud: Identity
    jwt: String!
    data: String!
    iat: Int
    nbf: Int
    vis: String
    tag: String
    vc: [VerifiableClaim]
  }

  type VerifiableClaim {
    hash: ID!
    parentHash: ID!
    rowId: String!
    iss: Identity!
    sub: Identity!
    json: String!
    jwt: String!
    nbf: Int
    iat: Int
    exp: Int
    fields: [VerifiableClaimField]
  }

  type VerifiableClaimField {
    rowId: String!
    hash: ID!
    parentHash: ID!
    iss: Identity!
    sub: Identity!
    type: String!
    value: String!
    isObj: Boolean!
  }

`
