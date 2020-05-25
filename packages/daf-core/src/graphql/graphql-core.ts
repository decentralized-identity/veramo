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
  SelectQueryBuilder,
  Brackets,
} from 'typeorm'
import { Agent } from '../agent'
import { Message } from '../entities/message'
import { Presentation } from '../entities/presentation'
import { Credential } from '../entities/credential'
import { Claim } from '../entities/claim'
import { Identity } from '../entities/identity'

export interface Context {
  agent: Agent
  authenticatedDid?: string
}

export interface Order {
  column: string
  direction: 'ASC' | 'DESC'
}

export interface Where {
  column: string
  value?: string[]
  not?: boolean
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

function opToSQL(item: Where): any[] {
  switch (item.op) {
    case 'IsNull':
      return ['IS NULL', '']
    case 'Like':
      if (item.value?.length != 1) throw Error('Operation Equal requires one value')
      return ['LIKE :value', item.value[0]]
    case 'Equal':
      if (item.value?.length != 1) throw Error('Operation Equal requires one value')
      return ['= :value', item.value[0]]
    case 'Any':
    case 'Between':
    case 'LessThan':
    case 'LessThanOrEqual':
    case 'MoreThan':
    case 'MoreThanOrEqual':
      throw new Error(`${item.op} not compatable with DID argument`)
    case 'In':
    default:
      return ['IN (:...value)', item.value]
  }
}

function addAudienceQuery(input: FindInput, qb: SelectQueryBuilder<any>): SelectQueryBuilder<any> {
  if (!Array.isArray(input.where)) {
    return qb
  }
  const audienceWhere = input.where.find(item => item.column === 'audience')
  if (!audienceWhere) {
    return qb
  }
  const [op, value] = opToSQL(audienceWhere)
  return qb.andWhere(`audience.did ${op}`, { value })
}

function createWhereObject(input: FindInput): any {
  if (input?.where) {
    const where = {}
    for (const item of input.where) {
      if (item.column === 'audience') {
        continue
      }
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
      if (item.not === true) {
        where[item.column] = Not(where[item.column])
      }
    }
    return where
  }
}

function decorateQB(
  qb: SelectQueryBuilder<any>,
  tableName: string,
  input: FindInput,
): SelectQueryBuilder<any> {
  if (input?.skip) qb = qb.skip(input.skip)
  if (input?.take) qb = qb.take(input.take)

  if (input?.order) {
    for (const item of input.order) {
      qb = qb.orderBy(
        qb.connection.driver.escape(tableName) + '.' + qb.connection.driver.escape(item.column),
        item.direction,
      )
    }
  }
  return qb
}

function checkAuthIdentity(did: string, authenticatedDid?: string): boolean {
  if (!authenticatedDid) {
    return true
  }
  if (authenticatedDid !== did) {
    throw new Error('can not access restricted properties of another identity')
  }
  return true
}

export interface FindArgs {
  input?: FindInput
}

const messagesQuery = async (_: any, args: FindArgs, ctx: Context): Promise<SelectQueryBuilder<any>> => {
  const where = createWhereObject(args.input)
  let qb = (await ctx.agent.dbConnection)
    .getRepository(Message)
    .createQueryBuilder('message')
    .leftJoinAndSelect('message.from', 'from')
    .leftJoinAndSelect('message.to', 'to')
    .where(where)
  qb = decorateQB(qb, 'message', args.input)
  if (ctx.authenticatedDid) {
    qb = qb.andWhere(
      new Brackets(qb => {
        qb.where('message.to = :ident', { ident: ctx.authenticatedDid }).orWhere('message.from = :ident', {
          ident: ctx.authenticatedDid,
        })
      }),
    )
  }
  return qb
}

const messages = async (_: any, args: FindArgs, ctx: Context) => {
  return (await messagesQuery(_, args, ctx)).getMany()
}

const messagesCount = async (_: any, args: FindArgs, ctx: Context) => {
  return (await messagesQuery(_, args, ctx)).getCount()
}

const presentationsQuery = async (_: any, args: FindArgs, ctx: Context) => {
  const where = createWhereObject(args.input)
  let qb = (await ctx.agent.dbConnection)
    .getRepository(Presentation)
    .createQueryBuilder('presentation')
    .leftJoinAndSelect('presentation.issuer', 'issuer')
    .leftJoinAndSelect('presentation.audience', 'audience')
    .where(where)
  qb = decorateQB(qb, 'presentation', args.input)
  qb = addAudienceQuery(args.input, qb)
  if (ctx.authenticatedDid) {
    qb = qb.andWhere(
      new Brackets(qb => {
        qb.where('audience.did = :ident', {
          ident: ctx.authenticatedDid,
        }).orWhere('presentation.issuer = :ident', { ident: ctx.authenticatedDid })
      }),
    )
  }
  return qb
}

const presentations = async (_: any, args: FindArgs, ctx: Context) => {
  return (await presentationsQuery(_, args, ctx)).getMany()
}

const presentationsCount = async (_: any, args: FindArgs, ctx: Context) => {
  return (await presentationsQuery(_, args, ctx)).getCount()
}

const credentialsQuery = async (_: any, args: FindArgs, ctx: Context) => {
  const where = createWhereObject(args.input)
  let qb = (await ctx.agent.dbConnection)
    .getRepository(Credential)
    .createQueryBuilder('credential')
    .leftJoinAndSelect('credential.issuer', 'issuer')
    .leftJoinAndSelect('credential.subject', 'subject')
    .where(where)
  qb = decorateQB(qb, 'credential', args.input)
  if (ctx.authenticatedDid) {
    qb = qb.andWhere(
      new Brackets(qb => {
        qb.where('credential.subject = :ident', { ident: ctx.authenticatedDid }).orWhere(
          'credential.issuer = :ident',
          {
            ident: ctx.authenticatedDid,
          },
        )
      }),
    )
  }
  return qb
}

const credentials = async (_: any, args: FindArgs, ctx: Context) => {
  return (await credentialsQuery(_, args, ctx)).getMany()
}

const credentialsCount = async (_: any, args: FindArgs, ctx: Context) => {
  return (await credentialsQuery(_, args, ctx)).getCount()
}

const claimsQuery = async (_: any, args: FindArgs, ctx: Context) => {
  const where = createWhereObject(args.input)
  let qb = (await ctx.agent.dbConnection)
    .getRepository(Claim)
    .createQueryBuilder('claim')
    .leftJoinAndSelect('claim.issuer', 'issuer')
    .leftJoinAndSelect('claim.subject', 'subject')
    .where(where)
  qb = decorateQB(qb, 'claim', args.input)
  qb = qb.leftJoinAndSelect('claim.credential', 'credential')
  if (ctx.authenticatedDid) {
    qb = qb.andWhere(
      new Brackets(qb => {
        qb.where('claim.subject = :ident', { ident: ctx.authenticatedDid }).orWhere('claim.issuer = :ident', {
          ident: ctx.authenticatedDid,
        })
      }),
    )
  }
  return qb
}

const claims = async (_: any, args: FindArgs, ctx: Context) => {
  return (await claimsQuery(_, args, ctx)).getMany()
}

const claimsCount = async (_: any, args: FindArgs, ctx: Context) => {
  return (await claimsQuery(_, args, ctx)).getCount()
}

export const resolvers = {
  Mutation: {
    handleMessage: async (
      _: any,
      args: { raw: string; metaData?: [{ type: string; value?: string }]; save: boolean },
      ctx: Context,
    ) => {
      if (ctx.authenticatedDid) {
        const authMeta = { type: 'sender', value: ctx.authenticatedDid }
        if (Array.isArray(args.metaData)) {
          args.metaData.push(authMeta)
        } else {
          args.metaData = [authMeta]
        }
      }
      return ctx.agent.handleMessage(args)
    },
  },

  Query: {
    identity: async (_: any, { did }, ctx: Context) =>
      checkAuthIdentity(did, ctx.authenticatedDid) &&
      (await ctx.agent.dbConnection).getRepository(Identity).findOne(did),
    identities: async (_: any, { input }, ctx: Context) => {
      if (ctx.authenticatedDid) {
        throw new Error('searching for identities is restricted')
      }
      return (await ctx.agent.dbConnection).getRepository(Identity).find({ ...input?.options })
    },
    message: async (_: any, { id }, ctx: Context) => {
      let qb = (await ctx.agent.dbConnection)
        .getRepository(Message)
        .createQueryBuilder('message')
        .leftJoinAndSelect('message.from', 'from')
        .leftJoinAndSelect('message.to', 'to')
        .where('message.id = :id', { id })
      if (ctx.authenticatedDid) {
        qb = qb.andWhere(
          new Brackets(qb => {
            qb.where('message.to = :ident', { ident: ctx.authenticatedDid }).orWhere(
              'message.from = :ident',
              {
                ident: ctx.authenticatedDid,
              },
            )
          }),
        )
      }
      return qb.getOne()
    },
    messages,
    messagesCount,
    presentation: async (_: any, { hash }, ctx: Context) => {
      let qb = (await ctx.agent.dbConnection)
        .getRepository(Presentation)
        .createQueryBuilder('presentation')
        .leftJoinAndSelect('presentation.issuer', 'issuer')
        .leftJoinAndSelect('presentation.audience', 'audience')
        .where('presentation.hash = :hash', { hash })
      if (ctx.authenticatedDid) {
        qb = qb.andWhere(
          new Brackets(qb => {
            qb.where('audience.did = :ident', {
              ident: ctx.authenticatedDid,
            }).orWhere('presentation.issuer = :ident', { ident: ctx.authenticatedDid })
          }),
        )
      }
      return qb.getOne()
    },
    presentations,
    presentationsCount,
    credential: async (_: any, { hash }, ctx: Context) => {
      let qb = (await ctx.agent.dbConnection)
        .getRepository(Credential)
        .createQueryBuilder('credential')
        .leftJoinAndSelect('credential.issuer', 'issuer')
        .leftJoinAndSelect('credential.subject', 'subject')
        .where('credential.hash = :hash', { hash })
      if (ctx.authenticatedDid) {
        qb = qb.andWhere(
          new Brackets(qb => {
            qb.where('credential.subject = :ident', {
              ident: ctx.authenticatedDid,
            }).orWhere('credential.issuer = :ident', { ident: ctx.authenticatedDid })
          }),
        )
      }
      qb.getOne()
    },
    credentials,
    credentialsCount,
    claim: async (_: any, { hash }, ctx: Context) => {
      let qb = (await ctx.agent.dbConnection)
        .getRepository(Claim)
        .createQueryBuilder('claim')
        .leftJoinAndSelect('claim.issuer', 'issuer')
        .leftJoinAndSelect('claim.subject', 'subject')
        .leftJoinAndSelect('claim.credential', 'credential')
        .where('claim.hash = :hash', { hash })
      if (ctx.authenticatedDid) {
        qb = qb.andWhere(
          new Brackets(qb => {
            qb.where('claim.subject = :ident', { ident: ctx.authenticatedDid }).orWhere(
              'claim.issuer = :ident',
              {
                ident: ctx.authenticatedDid,
              },
            )
          }),
        )
      }
      qb.getOne()
    },
    claims,
    claimsCount,
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
    not: Boolean
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



  enum IdentitiesColumns {
    saveDate
    updateDate
    did
    provider
  }

  input IdentitiesWhere {
    column: IdentitiesColumns!
    value: [String]
    not: Boolean
    op: WhereOperation
  }

  input IdentitiesOrder {
    column: IdentitiesColumns!
    direction: OrderDirection!
  }

  input IdentitiesInput {
    where: [IdentitiesWhere]
    order: [IdentitiesOrder]
    take: Int
    skip: Int
  }


  enum PresentationsColumns {
    id
    issuanceDate
    expirationDate
    context
    type
    issuer
    audience
  }

  input PresentationsWhere {
    column: PresentationsColumns!
    value: [String]
    not: Boolean
    op: WhereOperation
  }

  input PresentationsOrder {
    column: PresentationsColumns!
    direction: OrderDirection!
  }

  input PresentationsInput {
    where: [PresentationsWhere]
    order: [PresentationsOrder]
    take: Int
    skip: Int
  }


  enum CredentialsColumns {
    id
    issuanceDate
    expirationDate
    context
    type
    issuer
    subject
  }

  input CredentialsWhere {
    column: CredentialsColumns!
    value: [String]
    not: Boolean
    op: WhereOperation
  }

  input CredentialsOrder {
    column: CredentialsColumns!
    direction: OrderDirection!
  }

  input CredentialsInput {
    where: [CredentialsWhere]
    order: [CredentialsOrder]
    take: Int
    skip: Int
  }


  enum ClaimsColumns {
    issuanceDate
    expirationDate
    context
    credentialType
    type
    value
    issuer
    subject
  }

  input ClaimsWhere {
    column: ClaimsColumns!
    value: [String]
    not: Boolean
    op: WhereOperation
  }

  input ClaimsOrder {
    column: ClaimsColumns!
    direction: OrderDirection!
  }

  input ClaimsInput {
    where: [ClaimsWhere]
    order: [ClaimsOrder]
    take: Int
    skip: Int
  }



  extend type Query {
    identity(did: String!): Identity
    identities(input: IdentitiesInput): [Identity]
    message(id: ID!): Message
    messages(input: MessagesInput): [Message]
    messagesCount(input: MessagesInput): Int
    presentation(hash: ID!): Presentation
    presentations(input: PresentationsInput): [Presentation]
    presentationsCount(input: PresentationsInput): Int
    credential(hash: ID!): Credential
    credentials(input: CredentialsInput): [Credential]
    credentialsCount(input: CredentialsInput): Int
    claim(hash: ID!): Claim
    claims(input: ClaimsInput): [Claim]
    claimsCount(input: ClaimsInput): Int
  }

  input MetaDataInput {
    type: String!
    value: String
  }
  extend type Mutation {
    handleMessage(raw: String!, metaData: [MetaDataInput], save: Boolean = true): Message
  }


  extend type Identity {
    shortDid: String!
    latestClaimValue(type: String): String
    saveDate: Date!
    updateDate: Date!
  }


  
  extend type Message {
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
    replyUrl: String
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

  extend type Presentation {
    hash: ID!
    id: String
    raw: String!
    issuer: Identity!
    audience: [Identity]!
    issuanceDate: Date!
    expirationDate: Date
    context: [String]
    type: [String]
    credentials: [Credential]
    messages: [Message]
  }
  
  extend type Credential {
    hash: ID!
    id: String
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

  extend type Claim {
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
