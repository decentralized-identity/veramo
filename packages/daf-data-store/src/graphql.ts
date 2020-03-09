import { DataStore } from './data-store'

export interface Context {
  dataStore: DataStore
}

export const resolvers = {
  Message: {
    vc: async (message: any, {}, { dataStore }: Context) => dataStore.credentialsForMessageId(message.id),
    metaData: async (message: any, {}, { dataStore }: Context) => dataStore.messageMetaData(message.id),
    thread: async (message: any, {}, { dataStore }: Context) => {
      if (!message.threadId) {
        return []
      }
      const messages = await dataStore.findMessages({ threadId: message.threadId })
      return messages.filter((item: any) => item.id !== message.id)
    },
  },
  VerifiableClaim: {
    fields: async (vc: any, {}, { dataStore }: Context) => dataStore.credentialsFieldsForClaimHash(vc.hash),
    inMessages: async (vc: any, {}, { dataStore }: Context) => dataStore.findMessagesByVC(vc.hash),
  },
  Identity: {
    shortId: async (identity: any, {}, { dataStore }: Context) => dataStore.shortId(identity.did),
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
    credentialsIssued: async (identity: any, args: any, { dataStore }: Context) => {
      return dataStore.findCredentials({ iss: identity.did })
    },
    credentialsReceived: async (identity: any, args: any, { dataStore }: Context) => {
      return dataStore.findCredentials({ sub: identity.did })
    },
    credentialsAll: async (identity: any, args: any, { dataStore }: Context) => {
      return dataStore.findCredentials({ iss: identity.did, sub: identity.did })
    },
    messagesSent: async (identity: any, args: any, { dataStore }: Context) => {
      return dataStore.findMessages({ sender: identity.did })
    },
    messagesReceived: async (identity: any, args: any, { dataStore }: Context) => {
      return dataStore.findMessages({ receiver: identity.did })
    },
    messagesAll: async (identity: any, args: any, { dataStore }: Context) => {
      return dataStore.findMessages({ sender: identity.did, receiver: identity.did })
    },
  },
  Query: {
    identity: async (_: any, { did }: { did: string }, { dataStore }: Context) =>
      dataStore.findIdentityByDid(did),
    identities: async (_: any, { dids }: { dids: string[] }, { dataStore }: Context) => {
      return dids ? dids.map(did => ({ did })) : dataStore.allIdentities()
    },
    messages: async (
      _: any,
      {
        sender,
        receiver,
        threadId,
        limit,
      }: { sender: string; receiver: string; threadId: string; limit: number },
      { dataStore }: Context,
    ) => {
      return dataStore.findMessages({ sender, receiver, threadId, limit })
    },
    message: async (_: any, { id }: { id: string }, { dataStore }: Context) => dataStore.findMessage(id),
    credentials: async (_: any, { iss, sub }: { iss: string; sub: string }, { dataStore }: Context) => {
      const res = await dataStore.findCredentials({ iss, sub })
      return res
    },
    credential: async (_: any, { id }: { id: string }, { dataStore }: Context) =>
      dataStore.findCredential(id),
  },
  Mutation: {
    deleteMessage: async (_: any, { id }: { id: string }, { dataStore }: Context) =>
      dataStore.deleteMessage(id),
  },
}

export const typeDefs = `
  extend type Query {
    identity(did: ID!): Identity
    identities(dids: [ID!]): [Identity]
    messages(sender: ID, reveiver: ID, threadId: String, limit: Int): [Message]
    message(id: ID!): Message!
    credentials(iss: ID, sub: ID): [VerifiableClaim]
    credential(id:ID!): VerifiableClaim!
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
    messagesSent: [Message]
    messagesReceived: [Message]
    messagesAll: [Message]
    credentialsIssued: [VerifiableClaim]
    credentialsReceived: [VerifiableClaim]
    credentialsAll: [VerifiableClaim]
  }
  
  extend type Message {
    vc: [VerifiableClaim]
  }

  type VerifiableClaim {
    hash: ID!
    rowId: String!
    iss: Identity!
    sub: Identity!
    json: String!
    jwt: String!
    nbf: Int
    iat: Int
    exp: Int
    fields: [VerifiableClaimField]
    inMessages: [Message]
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
export default {
  resolvers,
  typeDefs,
}
