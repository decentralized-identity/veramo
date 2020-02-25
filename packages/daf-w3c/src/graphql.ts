import { Core } from 'daf-core'
import { ActionTypes, ActionSignW3cVc, ActionSignW3cVp } from './action-handler'

interface Context {
  core: Core
}
export interface CredentialSubject {
  [x: string]: any
}

export interface VC {
  '@context': string[]
  type: string[]
  credentialSubject: CredentialSubject
}

export interface VerifiableCredentialPayload {
  sub: string
  vc: VC
  nbf?: number
  aud?: string
  exp?: number
  jti?: string
  [x: string]: any
}

export interface VP {
  '@context': string[]
  type: string[]
  verifiableCredential: string[]
}

export interface PresentationPayload {
  vp: VP
  aud?: string
  nbf?: number
  exp?: number
  jti?: string
  [x: string]: any
}

interface VCInput {
  context: string[]
  type: string[]
  credentialSubject: CredentialSubject
}

interface VerifiableCredentialInput {
  vc: VCInput
  tag?: string
  sub: string
  nbf?: number
  aud?: string
  exp?: number
  jti?: string
  [x: string]: any
}

interface VPInput {
  context: string[]
  type: string[]
  verifiableCredential: string[]
}

interface VerifiablePresentationInput {
  vp: VPInput
  aud?: string
  nbf?: number
  exp?: number
  jti?: string
  [x: string]: any
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
    vc: {
      type: data.vc.type,
      '@context': data.vc.context,
      credentialSubject: data.vc.credentialSubject,
    },
  }
  if (data.iat) payload['iat'] = data.iat
  if (data.nbf) payload['nbf'] = data.nbf
  if (data.aud) payload['aud'] = data.aud
  if (data.jit) payload['jit'] = data.jit
  if (data.tag) payload['tag'] = data.tag

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
    aud: data.aud,
    vp: {
      type: data.vp.type,
      '@context': data.vp.context,
      verifiableCredential: data.vp.verifiableCredential,
    },
  }
  if (data.iat) payload['iat'] = data.iat
  if (data.nbf) payload['nbf'] = data.nbf
  if (data.jit) payload['jit'] = data.jit
  if (data.tag) payload['tag'] = data.tag

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
    tag: String
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
    tag: String
    vp: VP!
  }

  extend type Mutation {
    actionSignVc(did: String!, data: VerifiableCredentialInput!): String
    actionSignVp(did: String!, data: VerifiablePresentationInput!): String
  }
`
