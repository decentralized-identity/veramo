export const baseTypeDefs = `
  type Query 

  type Mutation 
  
  type Identity {
    did: ID!
  }
  
  type Message {
    id: ID!
    threadId: String
    rowId: String!
    type: String!
    sender: Identity
    receiver: Identity
    raw: String!
    data: String
    timestamp: Int
    metaData: [MessageMetaData]
    thread: [Message]
  }

  type MessageMetaData {
    rowId: String!
    type: String!
    id: String
    data: String
  }
  
`
