import { IAgentGraphQLMethod } from '../types'

export const getVerifiableCredentialsForSdr: IAgentGraphQLMethod = {
  type: 'Query',
  query: `
    query getVerifiableCredentialsForSdr($sdr: SelectiveDisclosureRequest!, $did: String) {
      getVerifiableCredentialsForSdr(sdr: $sdr, did: $did)
    }
  `,
  typeDef: `
    scalar SelectiveDisclosureRequest
    scalar CredentialsForSdr
    extend type Query {
      getVerifiableCredentialsForSdr(sdr: SelectiveDisclosureRequest!, did: String): [CredentialsForSdr]
    }
  `,
}

export const validatePresentationAgainstSdr: IAgentGraphQLMethod = {
  type: 'Query',
  query: `
    query validatePresentationAgainstSdr($sdr: SelectiveDisclosureRequest!, $presentation: VerifiablePresentation) {
      validatePresentationAgainstSdr(sdr: $sdr, presentation: $presentation)
    }
  `,
  typeDef: `
    scalar ValidatePresentationAgainstSdrResult
    extend type Query {
      validatePresentationAgainstSdr(sdr: SelectiveDisclosureRequest!, presentation: VerifiablePresentation): ValidatePresentationAgainstSdrResult
    }
  `,
}

export const createSelectiveDisclosureRequest: IAgentGraphQLMethod = {
  type: 'Mutation',
  query: `
    mutation createSelectiveDisclosureRequest($data: SelectiveDisclosureRequestInput!) {
      createSelectiveDisclosureRequest(data: $data) 
    }
  `,
  typeDef: `
    scalar SelectiveDisclosureRequestInput
    extend type Mutation {
      createSelectiveDisclosureRequest(data: SelectiveDisclosureRequestInput!): String!
    }
  `,
}

export const supportedMethods: Record<string, IAgentGraphQLMethod> = {
  getVerifiableCredentialsForSdr,
  createSelectiveDisclosureRequest,
  validatePresentationAgainstSdr,
}

export default supportedMethods
