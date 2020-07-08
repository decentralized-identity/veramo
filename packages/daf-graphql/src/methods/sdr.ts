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

export const supportedMethods: Record<string, IAgentGraphQLMethod> = {
  getVerifiableCredentialsForSdr,
}

export default supportedMethods
