export const baseTypeDef = `
type Query
type Mutation

type Identity {
  did: String!
  provider: String
}

scalar Object
scalar Date
scalar VerifiablePresentation
scalar VerifiableCredential
scalar Presentation
scalar Credential

type Message {
  id: ID!
  createdAt: Date
  expiresAt: Date
  threadId: String
  type: String!
  raw: String
  data: Object
  replyTo: [String]
  replyUrl: String
  from: String
  to: String
  metaData: [MetaData]
  presentations: [VerifiablePresentation]
  credentials: [VerifiableCredential]
}

type MetaData {
  type: String!
  value: String
}


`
