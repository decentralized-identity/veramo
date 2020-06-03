import { ApolloServer } from 'apollo-server'
import { agent } from './setup'
import { typeDefs, resolvers } from './schema'

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: { agent },
  introspection: true,
})

const port = 3000
server.listen({ port }).then(info => console.log(`🚀  Server ready at ${info.url}`))
