import { Core } from 'daf-core'
import { DataStore } from 'daf-data-store'
import { ActionTypes, ActionSignSdr, SDRInput } from './action-handler'
import { decodeJWT } from 'did-jwt'

interface Context {
  core: Core
  dataStore: DataStore
}

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

const sdr = async (message: any, { sub }: { sub: string }, { dataStore }: Context) => {
  const { payload } = (await decodeJWT(message.jwt)) as any
  const result: any = []
  const subject = sub || message.sub.did
  for (const credentialRequest of payload.claims) {
    const credentials = await dataStore.findCredentialsByFields({
      iss: credentialRequest.iss && credentialRequest.iss.map((iss: any) => iss.did),
      sub: [subject],
      claim_type: credentialRequest.claimType,
    })

    result.push({
      ...credentialRequest,
      vc: credentials.map((credential: any) => ({
        ...credential,
        __typename: 'VerifiableClaim',
      })),
    })
  }

  return result
}

export const resolvers = {
  Message: {
    sdr,
  },
  Mutation: {
    actionSignSDR,
  },
}

export const typeDefs = `
  input IssuerInput {
    did: String
    url: String
  }

  input CredentialRequestInput {
    iss: [IssuerInput]
    reason: String
    claimType: String
    essential: Boolean
  }

  input SDRInput {
    tag: String
    claims: [CredentialRequestInput]!
  }

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
    sdr(sub: String): [CredentialRequest]
  }

  extend type Mutation {
    actionSignSDR(did: String!, data: SDRInput!): String
  }
`
