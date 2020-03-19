export const baseTypeDefs = `
  type Query 

  type Mutation 
  
  scalar Date

  type Identity {
    did: ID!
    provider: String
    sentMessages: [Message]
    receivedMessages: [Message]
    issuedPresentations: [Presentation]
    receivedPresentations: [Presentation]
    issuedCredentials: [Credential]
    receivedCredentials: [Credential]
    issuedClaims: [Claim]
    receivedClaims: [Claim]
  }
  
  type Message {
    id: ID!
    saveDate: Date!
    updateDate: Date!
    createdAt: Date
    expiresAt: Date
    threadId: String
    type: String!
    raw: String
    data: String
    replyTo: [String]
    replyUrl: [String]
    from: Identity
    to: Identity
    metaData: [MetaData]
    presentations: [Presentation]
    credentials: [Credential]
  }

  type MetaData {
    type: String!
    value: String
  }

  type Presentation {
    hash: ID!
    raw: String!
    issuer: Identity!
    audience: Identity!
    issuanceDate: Date!
    expirationDate: Date
    context: [String]
    type: [String]
    credentials: [Credential]
    messages: [Message]
  }

  scalar CredentialSubject
  
  type Credential {
    hash: ID!
    raw: String!
    issuer: Identity!
    subject: Identity!
    issuanceDate: Date!
    expirationDate: Date
    context: [String]
    type: [String]
    credentialSubject: CredentialSubject
    claims: [Claim]
    presentations: [Presentation]
    messages: [Message]
  }

  type Claim {
    hash: ID!
    issuer: Identity!
    subject: Identity!
    credential: Credential!
    type: String!
    value: String!
    isObj: Boolean
  }  
`
