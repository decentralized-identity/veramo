import { Core } from '../core'
import { LastMessageTimestampForInstance } from '../service/service-manager'

import { Message } from '../message/message'

interface Context {
  core: Core
}

const newMessage = async (
  _: any,
  args: { raw: string; sourceType: string; sourceId?: string },
  ctx: Context,
) => {
  return await ctx.core.validateMessage(
    new Message({
      raw: args.raw,
      meta: {
        type: args.sourceType,
        id: args.sourceId,
      },
    }),
  )
}

const serviceMessagesSince = async (
  _: any,
  args: { ts: LastMessageTimestampForInstance[] },
  ctx: Context,
) => {
  const res = await ctx.core.getMessagesSince(args.ts)
  return res.map(msg => ({
    ...msg,
    data: JSON.stringify(msg.data),
    raw: msg.raw,
    metaData: msg.allMeta,
  }))
}

export const resolvers = {
  Query: {
    serviceMessagesSince,
  },
  Mutation: {
    newMessage,
  },
}

export const typeDefs = `
  input LastMessageTimestampForInstance {
    timestamp: Int!
    did: String!
    type: String!
    id: String!
  }

  type ServiceMessage {
    id: String!
    threadId: String,
    timestamp: Int,
    sender: String,
    receiver: String,
    type: String,
    raw: String,
    data: String,
    metaData: [MessageMetaData]
  }

  extend type Query {
    serviceMessagesSince(ts: [LastMessageTimestampForInstance]!): [ServiceMessage]
  }

  extend type Mutation {
    newMessage(raw: String!, sourceType: String!, sourceId: String): Message
  }
`
