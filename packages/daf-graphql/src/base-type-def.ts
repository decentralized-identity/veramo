export const baseTypeDef = `
type Query
type Mutation

type Identity {
  did: String!
  provider: String
}

scalar Object
scalar Date

`
