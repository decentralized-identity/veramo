export const baseTypeDefs = `
  type Query 

  type Mutation 

  type Identity {
    did: String!
    provider: String
  }

  type Message 
  type Presentation
  type Credential
  type Claim
  
  scalar Object
  scalar Date
`
