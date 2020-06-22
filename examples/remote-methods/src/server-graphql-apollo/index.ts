import { ApolloServer } from 'apollo-server'
import { createSchema } from 'daf-graphql'
import { agent } from './setup'

const enabledMethods = ['resolveDid', 'identityManagerCreateIdentity']

const { typeDefs, resolvers } = createSchema({ enabledMethods })

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: { agent },
  introspection: true,
})

const port = process.env.PORT || 3001
server.listen({ port }).then(info => {
  console.log(`🚀  Server ready at ${info.url}`)
  console.log('Available methods: ', agent.availableMethods())
  console.log('Enabled methods: ', enabledMethods)
})
