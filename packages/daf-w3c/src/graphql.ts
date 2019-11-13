import { Core } from 'daf-core'
import { ActionTypes } from './action-handler'

interface Context {
  core: Core
}

const actionSignVc = async (
  _: any,
  args: {
    from: string
    to: string
  },
  ctx: Context,
) => {
  return await ctx.core.handleAction({
    type: ActionTypes.signVc,
    data: {
      from: args.from,
      to: args.to,
    },
  })
}

export const resolvers = {
  Mutation: {
    actionSignVc,
  },
}

export const typeDefs = `
  extend type Mutation {
    actionSignVc(from: String!, to: String!): Boolean
  }
`
