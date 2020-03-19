import { In} from 'typeorm'
import { Core } from '../core'
import { Message } from '../entities/message'
import { Presentation } from '../entities/presentation'
import { Credential } from '../entities/credential'
import { Claim } from '../entities/claim'
import { Identity } from '../entities/identity'

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

const messages = async (
  _: any,
  args:{ input?: { 
    options?:{ take?: number, skip?: number },
    from?: string[],
    to?: string[],
    type?: string,
    threadId?: string,
   }},
) => {
  const options = { 
    relations: ['from', 'to'],
    where: {}
   }

  if (args.input?.from) options.where['from'] = In(args.input.from)
  if (args.input?.to) options.where['to'] = In(args.input.to)
  if (args.input?.type) options.where['type'] = args.input.type
  if (args.input?.threadId) options.where['threadId'] = args.input.threadId
  if (args.input?.options?.skip) options['skip'] = args.input.options.skip
  if (args.input?.options?.take) options['take'] = args.input.options.take

  return await Message.find(options)
}

const claims = async (
  _: any,
  args:{ input?: { 
    options?:{ take?: number, skip?: number },
    issuer?: string,
    subject?: string,
    type?: string,
    value?: string,
   }},
) => {
  const options = { 
    relations: ['issuer', 'subject', 'credential'],
    where: {}
   }

  if (args.input?.issuer) options.where['issuer'] = args.input.issuer
  if (args.input?.subject) options.where['subject'] = args.input.subject
  if (args.input?.type) options.where['type'] = args.input.type
  if (args.input?.value) options.where['value'] = args.input.value
  if (args.input?.options?.skip) options['skip'] = args.input.options.skip
  if (args.input?.options?.take) options['take'] = args.input.options.take

  return await Claim.find(options)
}

export const resolvers = {
  Identity: {
    sentMessages: async (identity: Identity) => (await Identity.findOne(identity.did, { relations: ['sentMessages', 'sentMessages.from', 'sentMessages.to']})).sentMessages,
    receivedMessages: async (identity: Identity) => (await Identity.findOne(identity.did, { relations: ['receivedMessages', 'receivedMessages.from', 'receivedMessages.to']})).receivedMessages,
    issuedPresentations: async (identity: Identity) => (await Identity.findOne(identity.did, { relations: ['issuedPresentations', 'issuedPresentations.issuer', 'issuedPresentations.audience']})).issuedPresentations,
    receivedPresentations: async (identity: Identity) => (await Identity.findOne(identity.did, { relations: ['receivedPresentations', 'receivedPresentations.issuer', 'receivedPresentations.audience']})).receivedPresentations,
    issuedCredentials: async (identity: Identity) => (await Identity.findOne(identity.did, { relations: ['issuedCredentials', 'issuedCredentials.issuer', 'issuedCredentials.subject']})).issuedCredentials,
    receivedCredentials: async (identity: Identity) => (await Identity.findOne(identity.did, { relations: ['receivedCredentials', 'receivedCredentials.issuer', 'receivedCredentials.subject']})).receivedCredentials,
    issuedClaims: async (identity: Identity) => (await Identity.findOne(identity.did, { relations: ['issuedClaims', 'issuedClaims.issuer', 'issuedClaims.subject']})).issuedClaims,
    receivedClaims: async (identity: Identity) => (await Identity.findOne(identity.did, { relations: ['receivedClaims', 'receivedClaims.issuer', 'receivedClaims.subject']})).receivedClaims,
  },

  Credential: {
    claims: async (credential: Credential) => Claim.find({ where: { credential: credential.hash}, relations: ['issuer', 'subject', 'credential'] }),
    messages: async (credential: Credential) => (await Credential.findOne(credential.hash, { relations: ['messages', 'messages.from', 'messages.to']}))?.messages,
    presentations: async (credential: Credential) => (await Credential.findOne(credential.hash, { relations: ['presentations', 'presentations.issuer', 'presentations.audience']})).presentations,
  },
  Presentation: {
    credentials: async (presentation: Presentation) => (await Presentation.findOne(presentation.hash, { relations: ['credentials', 'credentials.issuer', 'credentials.subject']})).credentials,
    messages: async (presentation: Presentation) => (await Presentation.findOne(presentation.hash, { relations: ['messages', 'messages.from', 'messages.to']})).messages
  },
  Message: {
    presentations: async (message: Message) => (await Message.findOne(message.id, { relations: ['presentations', 'presentations.issuer', 'presentations.audience']})).presentations,
    credentials: async (message: Message) => (await Message.findOne(message.id, { relations: ['credentials', 'credentials.issuer', 'credentials.subject']})).credentials,
  },
  Query: {
    messages,
    message: async (_: any, { id }) => Message.findOne(id, { relations: ['from', 'to'] }),
    identity: async (_: any, { did }) => Identity.findOne(did),
    credential: async (_: any, { hash }) => Credential.findOne(hash, { relations: ['issuer', 'subject'] }),
    identities: async () => Identity.find(),
    claims,
  },
  Mutation: {
    saveNewMessage,
  },
}

export const typeDefs = `

  input FindOptions {
    take: Int
    skip: Int
  }

  input MessagesInput {
    from: [String]
    to: [String]
    type: String
    threadId: String
    options: FindOptions
  }

  input ClaimsInput {
    issuer: ID
    subject: ID
    type: String
    value: String
    options: FindOptions
  }

  extend type Query {
    identity(did: ID!): Identity
    identities: [Identity]
    message(id: ID!): Message
    messages(input: MessagesInput): [Message]
    claims(input: ClaimsInput): [Claim]
    credential(hash: ID!): Credential
  }

  extend type Mutation {
    saveNewMessage(raw: String!, metaDataType: String, metaDataValue: String): Message
  }
`
