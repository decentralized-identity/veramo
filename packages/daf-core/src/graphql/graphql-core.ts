import { Core } from '../core'
import { LastMessageTimestampForInstance } from '../service/service-manager'

import { Message } from '../entities/message'

export interface Context {
  core: Core
}

const newMessage = async (
  _: any,
  args: { raw: string; sourceType: string; sourceId?: string },
  ctx: Context,
) => {
  const message = await ctx.core.validateMessage(
    new Message({
      raw: args.raw,
      meta: {
        type: args.sourceType,
        value: args.sourceId,
      },
    }),
  )

  const res = {
    ...message,
    sender: message.from,
    receiver: message.to,
    data: JSON.stringify(message.data),
    id: message.id,
    raw: message.raw,
    __typename: 'Message',
  }
  return res
}

const serviceMessagesSince = async (
  _: any,
  args: { ts: LastMessageTimestampForInstance[] },
  ctx: Context,
) => {
  const res = await ctx.core.getMessagesSince(args.ts)
  return [] // FIXME
  // return res.map(msg => ({
  //   ...msg,
  //   id: msg.id,
  //   data: JSON.stringify(msg.data),
  //   raw: msg.raw,
  //   metaData: msg.allMeta,
  // }))
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
