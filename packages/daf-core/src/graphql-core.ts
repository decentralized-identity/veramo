import { Core } from './core'

interface Context {
  core: Core
}

const newMessage = async (_: any, args: { raw: string, sourceType: string, sourceId?: string }, ctx: Context) => {
  return await ctx.core.onRawMessage({ 
    raw: args.raw,
    meta: [{
      sourceType: args.sourceType,
      sourceId: args.sourceId
    }]
  })
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
