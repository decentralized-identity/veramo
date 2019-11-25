import { Core } from 'daf-core'
import { ActionTypes, ActionSignW3cVc } from './action-handler'
import { PresentationPayload, VerifiableCredentialPayload, VC } from 'did-jwt-vc/src/types'

interface Context {
  core: Core
}

interface VCInput extends VC {
  context: [string]
}

interface VerifiableCredentialInput extends VerifiableCredentialPayload {
  vc: VCInput
}

const actionSignVc = async (
  _: any,
  args: {
    did: string
    data: VerifiableCredentialInput
  },
  ctx: Context,
) => {
  const { data } = args
  const payload: VerifiableCredentialPayload = {
    sub: data.sub,
    nbf: data.nbf,
    jti: data.jti,
    aud: data.aud,
    vc: {
      type: data.vc.type,
      '@context': data.vc.context,
      credentialSubject: data.vc.credentialSubject,
    },
  }
  return await ctx.core.handleAction({
    type: ActionTypes.signVc,
    did: args.did,
    data: payload,
  } as ActionSignW3cVc)
}

export const resolvers = {
  Mutation: {
    actionSignVc,
  },
}

export const typeDefs = `
  scalar CredentialSubject

  input VC {
    context: [String]!
    type: [String]!
    credentialSubject: CredentialSubject!
  }

  input VerifiableCredentialInput {
    sub: String!
    nbf: Int
    aud: String
    exp: Int
    jti: String
    vc: VC
  }

  extend type Mutation {
    actionSignVc(did: String!, data: VerifiableCredentialInput!): String
  }
`
