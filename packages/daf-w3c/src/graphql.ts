import { Agent } from 'daf-core'
import {
  ActionTypes,
  ActionSignW3cVc,
  ActionSignW3cVp,
  CredentialInput,
  PresentationInput,
} from './action-handler'

export interface Context {
  agent: Agent
}

const signCredentialJwt = async (
  _: any,
  args: {
    data: CredentialInput
    save?: boolean
  },
  ctx: Context,
) =>
  ctx.agent.handleAction({
    type: ActionTypes.signCredentialJwt,
    data: args.data,
    save: args.save,
  } as ActionSignW3cVc)

const signPresentationJwt = async (
  _: any,
  args: {
    data: PresentationInput
    save?: boolean
  },
  ctx: Context,
) =>
  ctx.agent.handleAction({
    type: ActionTypes.signPresentationJwt,
    data: args.data,
    save: args.save,
  } as ActionSignW3cVp)

export const resolvers = {
  Mutation: {
    signCredentialJwt,
    signPresentationJwt,
  },
}

export const typeDefs = `
  scalar CredentialSubject

  input CredentialStatusInput {
    type: String!
    id: String!
  }

  input SignCredentialInput {
    id: String
    expirationDate: Date
    issuer: String!
    context: [String]!
    type: [String]!
    credentialSubject: CredentialSubject!
    credentialStatus: CredentialStatusInput
  }
  
  input SignPresentationInput {
    id: String
    expirationDate: Date
    tag: String
    issuer: String!
    audience: [String]!
    context: [String]!
    type: [String]!
    verifiableCredential: [String]!
  }

  extend type Mutation {
    signCredentialJwt(data: SignCredentialInput!, save: Boolean = true): Credential
    signPresentationJwt(data: SignPresentationInput!, save: Boolean = true): Presentation
  }
`
export default {
  resolvers,
  typeDefs,
}
