import { In } from 'typeorm'
import { Agent } from '../agent'
import { Message } from '../entities/message'
import { Presentation } from '../entities/presentation'
import { Credential } from '../entities/credential'
import { Claim } from '../entities/claim'
import { Identity } from '../entities/identity'

export interface Context {
  agent: Agent
}

export interface FindOptions {
  take?: number
  skip?: number
}

const messages = async (
  _: any,
  {
    input,
  }: {
    input?: {
      options?: FindOptions
      from?: string[]
      to?: string[]
      type?: string[]
      threadId?: string[]
    }
  },
) => {
  const options = {
    where: {},
  }

  if (input?.from) options.where['from'] = In(input.from)
  if (input?.to) options.where['to'] = In(input.to)
  if (input?.type) options.where['type'] = In(input.type)
  if (input?.threadId) options.where['threadId'] = In(input.threadId)
  if (input?.options?.skip) options['skip'] = input.options.skip
  if (input?.options?.take) options['take'] = input.options.take

  return Message.find(options)
}

const presentations = async (
  _: any,
  {
    input,
  }: {
    input?: {
      options?: FindOptions
      issuer?: string[]
      audience?: string[]
      type?: string[]
      context?: string[]
    }
  },
) => {
  const options = {
    where: {},
  }

  if (input?.issuer) options.where['issuer'] = In(input.issuer)
  if (input?.audience) options.where['audience'] = In(input.audience)
  if (input?.type) options.where['type'] = In(input.type)
  if (input?.context) options.where['context'] = In(input.context)
  if (input?.options?.skip) options['skip'] = input.options.skip
  if (input?.options?.take) options['take'] = input.options.take

  return Presentation.find(options)
}

const credentials = async (
  _: any,
  {
    input,
  }: {
    input?: {
      options?: FindOptions
      issuer?: string[]
      subject?: string[]
      type?: string[]
      context?: string[]
    }
  },
) => {
  const options = {
    where: {},
  }

  if (input?.issuer) options.where['issuer'] = In(input.issuer)
  if (input?.subject) options.where['audience'] = In(input.subject)
  if (input?.type) options.where['type'] = In(input.type)
  if (input?.context) options.where['context'] = In(input.context)
  if (input?.options?.skip) options['skip'] = input.options.skip
  if (input?.options?.take) options['take'] = input.options.take

  return Credential.find(options)
}

const claims = async (
  _: any,
  {
    input,
  }: {
    input?: {
      options?: FindOptions
      issuer?: string[]
      subject?: string[]
      type?: string[]
      value?: string[]
    }
  },
) => {
  const options = {
    relations: ['credential'],
    where: {},
  }

  if (input?.issuer) options.where['issuer'] = In(input.issuer)
  if (input?.subject) options.where['subject'] = In(input.subject)
  if (input?.type) options.where['type'] = In(input.type)
  if (input?.value) options.where['value'] = In(input.value)
  if (input?.options?.skip) options['skip'] = input.options.skip
  if (input?.options?.take) options['take'] = input.options.take

  return Claim.find(options)
}

export const resolvers = {
  Mutation: {
    handleMessage: async (
      _: any,
      args: { raw: string; metaData?: [{ type: string; value?: string }] },
      ctx: Context,
    ) => ctx.agent.handleMessage(args),
  },

  Query: {
    identity: async (_: any, { did }) => Identity.findOne(did),
    identities: async (_: any, { input }) => Identity.find({ ...input?.options }),
    message: async (_: any, { id }) => Message.findOne(id),
    messages,
    presentation: async (_: any, { hash }) => Presentation.findOne(hash),
    presentations,
    credential: async (_: any, { hash }) => Credential.findOne(hash),
    credentials,
    claim: async (_: any, { hash }) => Claim.findOne(hash, { relations: ['credential'] }),
    claims,
  },

  Identity: {
    sentMessages: async (identity: Identity) =>
      (await Identity.findOne(identity.did, { relations: ['sentMessages'] })).sentMessages,
    receivedMessages: async (identity: Identity) =>
      (await Identity.findOne(identity.did, { relations: ['receivedMessages'] })).receivedMessages,
    issuedPresentations: async (identity: Identity) =>
      (await Identity.findOne(identity.did, { relations: ['issuedPresentations'] })).issuedPresentations,
    receivedPresentations: async (identity: Identity) =>
      (await Identity.findOne(identity.did, { relations: ['receivedPresentations'] })).receivedPresentations,
    issuedCredentials: async (identity: Identity) =>
      (await Identity.findOne(identity.did, { relations: ['issuedCredentials'] })).issuedCredentials,
    receivedCredentials: async (identity: Identity) =>
      (await Identity.findOne(identity.did, { relations: ['receivedCredentials'] })).receivedCredentials,
    issuedClaims: async (identity: Identity) =>
      (await Identity.findOne(identity.did, { relations: ['issuedClaims'] })).issuedClaims,
    receivedClaims: async (identity: Identity) =>
      (await Identity.findOne(identity.did, { relations: ['receivedClaims'] })).receivedClaims,
  },

  Credential: {
    claims: async (credential: Credential) =>
      (await Credential.findOne(credential.hash, { relations: ['claims'] })).claims,
    messages: async (credential: Credential) =>
      (await Credential.findOne(credential.hash, { relations: ['messages'] })).messages,
    presentations: async (credential: Credential) =>
      (await Credential.findOne(credential.hash, { relations: ['presentations'] })).presentations,
  },

  Presentation: {
    credentials: async (presentation: Presentation) =>
      (await Presentation.findOne(presentation.hash, { relations: ['credentials'] })).credentials,
    messages: async (presentation: Presentation) =>
      (await Presentation.findOne(presentation.hash, { relations: ['messages'] })).messages,
  },

  Message: {
    presentations: async (message: Message) =>
      (await Message.findOne(message.id, { relations: ['presentations'] })).presentations,
    credentials: async (message: Message) =>
      (await Message.findOne(message.id, { relations: ['credentials'] })).credentials,
  },
}

export const typeDefs = `

  input FindOptions {
    take: Int
    skip: Int
  }

  input IdentitiesInput {
    options: FindOptions
  }

  input MessagesInput {
    from: [String]
    to: [String]
    type: [String]
    threadId: [String]
    options: FindOptions
  }

  input PresentationsInput {
    issuer: [String]
    audience: [String]
    type: [String]
    context: [String]
    options: FindOptions
  }

  input CredentialsInput {
    issuer: [String]
    subject: [String]
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
    handleMessage(raw: String!, meta: [MetaDataInput]): Message
  }


  extend type Identity {
    sentMessages: [Message]
    receivedMessages: [Message]
    issuedPresentations: [Presentation]
    receivedPresentations: [Presentation]
    issuedCredentials: [Credential]
    receivedCredentials: [Credential]
    issuedClaims: [Claim]
    receivedClaims: [Claim]
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
