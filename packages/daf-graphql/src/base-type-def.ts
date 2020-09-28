export const baseTypeDef = `
type Query
type Mutation

scalar KeyMeta

type Key {
  kid: String!
  kms: String!
  type: String!
  publicKeyHex: String!
  privateKeyHex: String
  meta: KeyMeta
}

input KeyInput {
  kid: String!
  kms: String!
  type: String!
  publicKeyHex: String!
  privateKeyHex: String
  meta: KeyMeta
}

type Service {
  id: String!
  type: String!
  serviceEndpoint: String!
  description: String
}

input ServiceInput {
  id: String!
  type: String!
  serviceEndpoint: String!
  description: String
}

type Identity {
  did: String!
  provider: String
  alias: String
  controllerKeyId: String
  keys: [Key]
  services: [Service]
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
