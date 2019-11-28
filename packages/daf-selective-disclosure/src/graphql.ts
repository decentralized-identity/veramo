import { Core } from 'daf-core'
import { ActionTypes, ActionSignSdr } from './action-handler'

interface Context {
  core: Core
}

interface SDRInput {}

const actionSignSDR = async (
  _: any,
  args: {
    did: string
    data: SDRInput
  },
  ctx: Context,
) => {
  const { data } = args

  return await ctx.core.handleAction({
    type: ActionTypes.signSdr,
    did: args.did,
    data: data,
  } as ActionSignSdr)
}

export const resolvers = {
  Mutation: {
    actionSignSDR,
  },
}

export const typeDefs = `

  type Issuer {
    did: String
    url: String
  }

  type CredentialRequest {
    iss: [Issuer]
    reason: String
    claimType: String
    essential: Boolean
    vc: [VerifiableClaim]
  }

  extend type Message {
    sdr: [CredentialRequest]
  }

  input SDRInput {
    reason: String
  }

  extend type Mutation {
    actionSignSDR(did: String!, data: SDRInput!): String
  }
`
