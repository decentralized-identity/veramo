export interface IAgentGraphQLMethod {
  type: 'Query' | 'Mutation'
  query: string
  typeDef: string
}
