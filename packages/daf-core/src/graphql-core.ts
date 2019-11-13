import { Core } from './core'

interface Context {
  core: Core
}

const newMessage = async (_: any, args: { raw: string }, ctx: Context) => {
  return await ctx.core.onRawMessage({ raw: args.raw })
}

export const resolvers = {
  Mutation: {
    newMessage,
  },
}

export const typeDefs = `
  extend type Mutation {
    newMessage(raw: String): Message
  }
`
