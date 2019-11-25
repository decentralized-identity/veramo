import { Core } from 'daf-core'
import { ActionTypes } from './action-handler'

interface Context {
  core: Core
}

const actionSendJwt = async (
  _: any,
  args: {
    from: string
    to: string
    jwt: string
  },
  ctx: Context,
) => {
  return await ctx.core.handleAction({
    type: ActionTypes.sendJwt,
    data: {
      from: args.from,
      to: args.to,
      jwt: args.jwt,
    },
  })
}

export const resolvers = {
  Mutation: {
    actionSendJwt,
  },
}

export const typeDefs = `
  extend type Mutation {
    actionSendJwt(from: String!, to: String!, jwt: String!): Boolean
  }
`
