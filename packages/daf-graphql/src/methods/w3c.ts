import { IAgentGraphQLMethod } from '../types'

export const createVerifiableCredential: IAgentGraphQLMethod = {
  type: 'Mutation',
  query: `
    mutation createVerifiableCredential($credential: Credential!, $proofFormat: String, $save: Boolean) {
      createVerifiableCredential(credential: $credential, proofFormat: $proofFormat, save: $save)
    }
  `,
  typeDef: `

    extend type Mutation {
      createVerifiableCredential(credential: Credential!, proofFormat: String, save: Boolean): VerifiableCredential
    }
  `,
}

export const createVerifiablePresentation: IAgentGraphQLMethod = {
  type: 'Mutation',
  query: `
    mutation createVerifiablePresentation($presentation: Presentation!, $proofFormat: String, $save: Boolean) {
      createVerifiablePresentation(presentation: $presentation, proofFormat: $proofFormat, save: $save)
    }
  `,
  typeDef: `

    extend type Mutation {
      createVerifiablePresentation(presentation: Presentation!, proofFormat: String, save: Boolean): VerifiableCredential
    }
  `,
}

export const supportedMethods: Record<string, IAgentGraphQLMethod> = {
  createVerifiableCredential,
  createVerifiablePresentation,
}

export default supportedMethods
