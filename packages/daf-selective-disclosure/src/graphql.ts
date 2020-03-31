import { Agent, Message, Claim } from 'daf-core'
import { DataStore } from 'daf-data-store'
import { ActionTypes, ActionSignSdr, SelectiveDisclosureRequest } from './action-handler'
import { findCredentialsForSdr } from './helper'

interface Context {
  agent: Agent
  dataStore: DataStore
}

const signSdrJwt = async (_: any, args: { data: SelectiveDisclosureRequest }, ctx: Context) => 
  ctx.agent.handleAction({
    type: ActionTypes.signSdr,
    data: args.data,
  } as ActionSignSdr)


const sdr = async (message: Message, { did }: { did: string }) => {
  return findCredentialsForSdr(message.data, did)
}

export const resolvers = {
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
    replyUrl: String
    tag: String
    claims: [CredentialRequestInput]!
  }

  type Issuer {
    did: Identity
    url: String
  }

  type CredentialRequest {
    issuers: [Issuer]
    credentialType: String
    credentialContext: String
    claimType: String!
    claimValue: String
    essential: Boolean
    credentials: [Credential]
  }

  extend type Message {
    sdr(did: ID): [CredentialRequest]
  }

  extend type Mutation {
    signSdrJwt(data: SDRInput!): String
  }
`
export default {
  typeDefs,
  resolvers,
}
