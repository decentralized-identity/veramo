import { Core } from '../core'
import { Message } from '../entities/message'
import { In, getRepository } from 'typeorm'
import { Presentation } from '../entities/presentation'
import { Credential } from '../entities/credential'
import { Claim } from '../entities/claim'

export interface Context {
  core: Core
}

const saveNewMessage = async (
  _: any,
  args: { raw: string; metaDataType?: string; metaDataValue?: string },
  ctx: Context,
) => {
  return await ctx.core.saveNewMessage(args)
}

const findMessages = async (
  _: any,
  args: { 
    options?:{ take?: number, skip?: number },
    from?: string[],
    to?: string[],
    type?: string,
    threadId?: string,
   },
  ctx: Context,
) => {
  const options = { where: {} }

  if (args.from) options.where['from'] = In(args.from)
  if (args.to) options.where['to'] = In(args.to)
  if (args.type) options.where['type'] = args.type
  if (args.threadId) options.where['threadId'] = args.threadId
  if (args.options?.skip) options['skip'] = args.options.skip
  if (args.options?.take) options['take'] = args.options.take

  return await Message.find(options)
}


export const resolvers = {
  Credential: {
    claims: async (credential: Credential, args, ctx) => {
      return getRepository(Claim).find({ where: { credential: credential.hash}, relations: ['issuer', 'subject'] })
    }
  },
  Presentation: {
    credentials: async (presentation: Presentation, args, ctx) => {
      return getRepository(Credential).find({ where: { presentations: presentation.hash}, relations: ['issuer', 'subject'] })
    }
  },
  Message: {
    presentations: async (message: Message, args, ctx) => {
      return getRepository(Presentation).find({ where: { messages: message.id}, relations: ['issuer', 'audience'] })
    },
    credentials: async (message: Message, args, ctx) => {
      return getRepository(Credential).find({ where: { messages: message.id}, relations: ['issuer', 'subject'] })
    }
  },
  Query: {
    findMessages,
  },
  Mutation: {
    saveNewMessage,
  },
}

export const typeDefs = `

  input FindOptions {
    take: Int
    skip: Int
    orderField: String
    orderDirection: String
  }

  input FindMessagesInput {
    from: [String]
    to: [String]
    type: String
    threadId: String
    options: FindOptions
  }

  extend type Query {
    findMessages(input: FindMessagesInput): [Message]
  }

  extend type Mutation {
    saveNewMessage(raw: String!, metaDataType: String, metaDataValue: String): Message
  }
`
