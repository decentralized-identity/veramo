import { Core } from './core'
import { Message } from './message'

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

export const resolvers = {
  Mutation: {
    newMessage,
  },
}

export const typeDefs = `
  extend type Mutation {
    newMessage(raw: String!, sourceType: String!, sourceId: String): Message
  }
`
