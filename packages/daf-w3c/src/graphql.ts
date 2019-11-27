import { Core } from 'daf-core'
import { ActionTypes, ActionSignW3cVc, ActionSignW3cVp } from './action-handler'
import { PresentationPayload, VerifiableCredentialPayload, VC, VP } from 'did-jwt-vc/src/types'

interface Context {
  core: Core
}

interface VCInput extends VC {
  context: [string]
}

interface VerifiableCredentialInput extends VerifiableCredentialPayload {
  vc: VCInput
}

interface VPInput extends VP {
  context: [string]
}

interface VerifiablePresentationInput extends PresentationPayload {
  vp: VPInput
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
  // This is needed because it is not possible to pass '@context' as gql input
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

const actionSignVp = async (
  _: any,
  args: {
    did: string
    data: VerifiablePresentationInput
  },
  ctx: Context,
) => {
  const { data } = args
  // This is needed because it is not possible to pass '@context' as gql input
  const payload: PresentationPayload = {
    nbf: data.nbf,
    jti: data.jti,
    aud: data.aud,
    vp: {
      type: data.vp.type,
      '@context': data.vp.context,
      verifiableCredential: data.vp.verifiableCredential,
    },
  }
  return await ctx.core.handleAction({
    type: ActionTypes.signVp,
    did: args.did,
    data: payload,
  } as ActionSignW3cVp)
}

export const resolvers = {
  Mutation: {
    actionSignVc,
    actionSignVp,
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
    vc: VC!
  }

  input VP {
    context: [String]!
    type: [String]!
    verifiableCredential: [String]!
  }

  input VerifiablePresentationInput {
    nbf: Int
    aud: String
    exp: Int
    jti: String
    vp: VP!
  }

  extend type Mutation {
    actionSignVc(did: String!, data: VerifiableCredentialInput!): String
    actionSignVp(did: String!, data: VerifiablePresentationInput!): String
  }
`
