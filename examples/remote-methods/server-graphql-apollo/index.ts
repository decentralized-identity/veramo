import { ApolloServer } from 'apollo-server'
import { agent } from './setup'
import { createSchema } from '../lib/daf-graphql'

const { typeDefs, resolvers } = createSchema(agent.availableMethods())

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: { agent },
  introspection: true,
})

const port = 3000
server.listen({ port }).then(info => {
  console.log(`🚀  Server ready at ${info.url}`)
  console.log('Available methods: ', agent.availableMethods())
})
