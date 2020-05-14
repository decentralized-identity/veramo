import { Agent, Message, Presentation } from 'daf-core'
import { ActionTypes, ActionSignSdr, SelectiveDisclosureRequest } from './action-handler'
import { findCredentialsForSdr, validatePresentationAgainstSdr } from './helper'
import { MessageTypes } from './message-handler'

interface Context {
  agent: Agent
}

const signSdrJwt = async (_: any, args: { data: SelectiveDisclosureRequest }, ctx: Context) =>
  ctx.agent.handleAction({
    type: ActionTypes.signSdr,
    data: args.data,
  } as ActionSignSdr)

const sdr = async (message: Message, { did }: { did: string }, ctx: Context) => {
  const dbConnection = await ctx.agent.dbConnection
  if (!dbConnection) {
    throw new Error('A database connection is required for this query')
  }
  if (message.type == MessageTypes.sdr) {
    return findCredentialsForSdr(dbConnection, message.data, did)
  }
  return []
}

const validateAgainstSdr = async (
  presentation: Presentation,
  { sdr }: { sdr: SelectiveDisclosureRequest },
  ctx: Context,
) => {
  const dbConnection = await ctx.agent.dbConnection
  if (!dbConnection) {
    throw new Error('A database connection is required for this query')
  }
  const fullPresentation = await dbConnection.getRepository(Presentation).findOne(presentation.hash, {
    relations: ['credentials', 'credentials.claims'],
  })
  if (!fullPresentation) {
    throw new Error(`No Presentation found with hash ${presentation.hash}`)
  }
  return validatePresentationAgainstSdr(fullPresentation, sdr)
}

export const resolvers = {
  Presentation: {
    validateAgainstSdr,
  },
  Message: {
    sdr,
  },
  Mutation: {
    signSdrJwt,
  },
}

export const typeDefs = `
  input IssuerInput {
    did: String
    url: String
  }

  input CredentialRequestInput {
    issuers: [IssuerInput]
    reason: String
    credentialType: String
    credentialContext: String
    claimType: String!
    claimValue: String
    essential: Boolean
  }

  input SDRInput {
    issuer: String!
    subject: String
    replyTo: [String]
    replyUrl: String
    tag: String
    claims: [CredentialRequestInput]!
    credentials: [String]
  }

  type Issuer {
    did: Identity
    url: String
  }

  type CredentialRequest {
    issuers: [Issuer]
    reason: String
    credentialType: String
    credentialContext: String
    claimType: String!
    claimValue: String
    essential: Boolean
    credentials: [Credential]
  }

  type PresentationValidation {
    valid: Boolean!
    claims: [CredentialRequest]
  }

  extend type Presentation {
    validateAgainstSdr(data: SDRInput!): PresentationValidation
  }

  extend type Message {
    sdr(did: String): [CredentialRequest]
  }

  extend type Mutation {
    signSdrJwt(data: SDRInput!): String
  }
`
export default {
  typeDefs,
  resolvers,
}
