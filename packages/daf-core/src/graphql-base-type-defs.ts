export const baseTypeDefs = `
  type Query 

  type Mutation 
  
  type Identity {
    did: ID!
  }
  
  type Message {
    hash: ID!
    rowId: String!
    type: String!
  }
  
`
