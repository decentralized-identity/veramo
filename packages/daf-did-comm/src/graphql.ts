import { Agent } from 'daf-core'
import { ActionTypes, ActionSendDIDComm } from './action-handler'

interface Context {
  agent: Agent
}

const sendMessageDidCommAlpha1 = async (
  _: any,
  args: {
    save: boolean
    url?: string
    data: {
      from: string
      to: string
      body: string
      type: string
    }
  },
  ctx: Context,
) => {
  return await ctx.agent.handleAction({
    type: ActionTypes.sendMessageDIDCommAlpha1,
    save: args.save,
    url: args.url,
    data: args.data,
  } as ActionSendDIDComm)
}

export const resolvers = {
  Mutation: {
    sendMessageDidCommAlpha1,
  },
}

export const typeDefs = `
  input SendMessageDidCommAlpha1Input {
    from: String!
    to: String!
    type: String!
    body: String!
  }
  extend type Mutation {
    sendMessageDidCommAlpha1(data: SendMessageDidCommAlpha1Input!, url: String, save: Boolean = true): Message
  }
`
export default {
  resolvers,
  typeDefs,
}
