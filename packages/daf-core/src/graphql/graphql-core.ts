import {
  Not,
  LessThan,
  LessThanOrEqual,
  MoreThan,
  MoreThanOrEqual,
  Equal,
  Like,
  Between,
  In,
  Any,
  IsNull,
  FindManyOptions,
} from 'typeorm'
import { Agent } from '../agent'
import { Message } from '../entities/message'
import { Presentation } from '../entities/presentation'
import { Credential } from '../entities/credential'
import { Claim } from '../entities/claim'
import { Identity } from '../entities/identity'

export interface Context {
  agent: Agent
}

export interface Order {
  column: string
  direction: 'ASC' | 'DESC'
}

export interface Where {
  column: string
  value?: string[]
  op?:
    | 'LessThan'
    | 'LessThanOrEqual'
    | 'MoreThan'
    | 'MoreThanOrEqual'
    | 'Equal'
    | 'Like'
    | 'Between'
    | 'In'
    | 'Any'
    | 'IsNull'
}
export interface FindInput {
  where?: Where[]
  order?: Order[]
  take?: number
  skip?: number
}

interface TypeOrmOrder {
  [x: string]: 'ASC' | 'DESC'
}

function transformFindInput(input: FindInput): FindManyOptions {
  const result: FindManyOptions = {
    where: {},
  }
  if (input?.skip) result['skip'] = input.skip
  if (input?.take) result['take'] = input.take
  if (input?.order) {
    const order: TypeOrmOrder = {}
    for (const item of input.order) {
      order[item.column] = item.direction
    }
    result['order'] = order
  }
  if (input?.where) {
    const where = {}
    for (const item of input.where) {
      switch (item.op) {
        case 'Any':
          where[item.column] = Any(item.value)
          break
        case 'Between':
          if (item.value?.length != 2) throw Error('Operation Between requires two values')
          where[item.column] = Between(item.value[0], item.value[1])
          break
        case 'Equal':
          if (item.value?.length != 1) throw Error('Operation Equal requires one value')
          where[item.column] = Equal(item.value[0])
          break
        case 'IsNull':
          where[item.column] = IsNull()
          break
        case 'LessThan':
          if (item.value?.length != 1) throw Error('Operation LessThan requires one value')
          where[item.column] = LessThan(item.value[0])
          break
        case 'LessThanOrEqual':
          if (item.value?.length != 1) throw Error('Operation LessThanOrEqual requires one value')
          where[item.column] = LessThanOrEqual(item.value[0])
          break
        case 'Like':
          if (item.value?.length != 1) throw Error('Operation Like requires one value')
          where[item.column] = Like(item.value[0])
          break
        case 'MoreThan':
          if (item.value?.length != 1) throw Error('Operation MoreThan requires one value')
          where[item.column] = MoreThan(item.value[0])
          break
        case 'MoreThanOrEqual':
          if (item.value?.length != 1) throw Error('Operation MoreThanOrEqual requires one value')
          where[item.column] = MoreThanOrEqual(item.value[0])
          break
        case 'In':
        default:
          where[item.column] = In(item.value)
      }
    }
    result['where'] = where
  }
  return result
}

export interface FindArgs {
  input?: FindInput
}

const messages = async (_: any, args: FindArgs, ctx: Context) => {
  return (await ctx.agent.dbConnection).getRepository(Message).find(transformFindInput(args.input))
}
const messagesCount = async (_: any, args: FindArgs, ctx: Context) => {
  return (await ctx.agent.dbConnection).getRepository(Message).count(transformFindInput(args.input))
}

const presentations = async (_: any, args: FindArgs, ctx: Context) => {
  const options = transformFindInput(args.input)
  return (await ctx.agent.dbConnection).getRepository(Presentation).find(options)
}

const credentials = async (_: any, args: FindArgs, ctx: Context) => {
  const options = transformFindInput(args.input)
  return (await ctx.agent.dbConnection).getRepository(Credential).find(options)
}

const claims = async (_: any, args: FindArgs, ctx: Context) => {
  const options = transformFindInput(args.input)
  options['relations'] = ['credential']
  return (await ctx.agent.dbConnection).getRepository(Claim).find(options)
}

export const resolvers = {
  Mutation: {
    handleMessage: async (
      _: any,
      args: { raw: string; metaData?: [{ type: string; value?: string }]; save: boolean },
      ctx: Context,
    ) => ctx.agent.handleMessage(args),
  },

  Query: {
    identity: async (_: any, { did }, ctx: Context) =>
      (await ctx.agent.dbConnection).getRepository(Identity).findOne(did),
    identities: async (_: any, { input }, ctx: Context) =>
      (await ctx.agent.dbConnection).getRepository(Identity).find({ ...input?.options }),
    message: async (_: any, { id }, ctx: Context) =>
      (await ctx.agent.dbConnection).getRepository(Message).findOne(id),
    messages,
    messagesCount,
    presentation: async (_: any, { hash }, ctx: Context) =>
      (await ctx.agent.dbConnection).getRepository(Presentation).findOne(hash),
    presentations,
    credential: async (_: any, { hash }, ctx: Context) =>
      (await ctx.agent.dbConnection).getRepository(Credential).findOne(hash),
    credentials,
    claim: async (_: any, { hash }, ctx: Context) =>
      (await ctx.agent.dbConnection).getRepository(Claim).findOne(hash, { relations: ['credential'] }),
    claims,
  },

  Identity: {
    shortDid: async (identity: Identity, args, ctx: Context) =>
      (await (await ctx.agent.dbConnection).getRepository(Identity).findOne(identity.did)).shortDid(),
    latestClaimValue: async (identity: Identity, args: { type: string }, ctx: Context) =>
      (
        await (await ctx.agent.dbConnection).getRepository(Identity).findOne(identity.did)
      ).getLatestClaimValue(ctx.agent.dbConnection, { type: args.type }),
  },

  Credential: {
    claims: async (credential: Credential, args, ctx: Context) =>
      credential.claims ||
      (
        await (await ctx.agent.dbConnection)
          .getRepository(Credential)
          .findOne(credential.hash, { relations: ['claims'] })
      ).claims,
    messages: async (credential: Credential, args, ctx: Context) =>
      (
        await (await ctx.agent.dbConnection)
          .getRepository(Credential)
          .findOne(credential.hash, { relations: ['messages'] })
      ).messages,
    presentations: async (credential: Credential, args, ctx: Context) =>
      (
        await (await ctx.agent.dbConnection)
          .getRepository(Credential)
          .findOne(credential.hash, { relations: ['presentations'] })
      ).presentations,
  },

  Presentation: {
    credentials: async (presentation: Presentation, args, ctx: Context) =>
      presentation.credentials ||
      (
        await (await ctx.agent.dbConnection)
          .getRepository(Presentation)
          .findOne(presentation.hash, { relations: ['credentials'] })
      ).credentials,
    messages: async (presentation: Presentation, args, ctx: Context) =>
      (
        await (await ctx.agent.dbConnection)
          .getRepository(Presentation)
          .findOne(presentation.hash, { relations: ['messages'] })
      ).messages,
  },

  Message: {
    presentations: async (message: Message, args, ctx: Context) =>
      message.presentations ||
      (
        await (await ctx.agent.dbConnection)
          .getRepository(Message)
          .findOne(message.id, { relations: ['presentations'] })
      ).presentations,
    credentials: async (message: Message, args, ctx: Context) =>
      message.credentials ||
      (
        await (await ctx.agent.dbConnection)
          .getRepository(Message)
          .findOne(message.id, { relations: ['credentials'] })
      ).credentials,
  },
}

export const typeDefs = `
  enum WhereOperation {
    Not
    LessThan
    LessThanOrEqual
    MoreThan
    MoreThanOrEqual
    Equal
    Like
    Between
    In
    Any
    IsNull
  }

  enum OrderDirection {
    ASC
    DESC
  }

  enum MessagesColumns {
    saveDate
    updateDate
    createdAt
    expiresAt
    threadId
    type
    replyTo
    replyUrl
    from
    to
  }

  input MessagesWhere {
    column: MessagesColumns!
    value: [String]
    op: WhereOperation
  }

  input MessagesOrder {
    column: MessagesColumns!
    direction: OrderDirection!
  }

  input MessagesInput {
    where: [MessagesWhere]
    order: [MessagesOrder]
    take: Int
    skip: Int
  }

  input OrderOptions {
    field: String!
    direction: OrderDirection!
  }

  input FindOptions {
    take: Int
    skip: Int
    order: [OrderOptions]
  }

  input IdentitiesInput {
    options: FindOptions
  }



  input PresentationsInput {
    issuer: [ID]
    audience: [ID]
    type: [String]
    context: [String]
    options: FindOptions
  }

  input CredentialsInput {
    issuer: [ID]
    subject: [ID]
    type: [String]
    context: [String]
    options: FindOptions
  }

  input ClaimsInput {
    issuer: [ID]
    subject: [ID]
    type: [String]
    value: [String]
    options: FindOptions
  }

  extend type Query {
    identity(did: ID!): Identity
    identities(input: IdentitiesInput): [Identity]
    message(id: ID!): Message
    messages(input: MessagesInput): [Message]
    messagesCount(input: MessagesInput): Int
    presentation(hash: ID!): Presentation
    presentations(input: PresentationsInput): [Presentation]
    credential(hash: ID!): Credential
    credentials(input: CredentialsInput): [Credential]
    claim(hash: ID!): Claim
    claims(input: ClaimsInput): [Claim]
  }

  input MetaDataInput {
    type: String!
    value: String
  }
  extend type Mutation {
    handleMessage(raw: String!, meta: [MetaDataInput], save: Boolean = true): Message
  }


  extend type Identity {
    shortDid: String!
    latestClaimValue(type: String): String
  }

  scalar Object
  scalar Date
  
  type Message {
    id: ID!
    saveDate: Date!
    updateDate: Date!
    createdAt: Date
    expiresAt: Date
    threadId: String
    type: String!
    raw: String
    data: Object
    replyTo: [String]
    replyUrl: [String]
    from: Identity
    to: Identity
    metaData: [MetaData]
    presentations: [Presentation]
    credentials: [Credential]
  }

  type MetaData {
    type: String!
    value: String
  }

  type Presentation {
    hash: ID!
    raw: String!
    issuer: Identity!
    audience: Identity!
    issuanceDate: Date!
    expirationDate: Date
    context: [String]
    type: [String]
    credentials: [Credential]
    messages: [Message]
  }
  
  type Credential {
    hash: ID!
    raw: String!
    issuer: Identity!
    subject: Identity
    issuanceDate: Date!
    expirationDate: Date
    context: [String]
    type: [String]
    credentialSubject: Object
    claims: [Claim]
    presentations: [Presentation]
    messages: [Message]
  }

  type Claim {
    hash: ID!
    issuer: Identity!
    subject: Identity
    credential: Credential!
    issuanceDate: Date!
    expirationDate: Date
    context: [String]
    credentialType: [String]
    type: String!
    value: String!
    isObj: Boolean
  } 
`
