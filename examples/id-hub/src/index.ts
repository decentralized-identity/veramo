import * as Daf from 'daf-core'
import { JwtMessageHandler } from 'daf-did-jwt'
import { W3cMessageHandler } from 'daf-w3c'
import { SdrMessageHandler } from 'daf-selective-disclosure'
import { DafResolver } from 'daf-resolver'
import { ApolloServer } from 'apollo-server'
import merge from 'lodash.merge'
import { createConnection } from 'typeorm'
import { verifyJWT } from 'did-jwt'

const infuraProjectId = '5ffc47f65c4042ce847ef66a3fa70d4c'

let didResolver = new DafResolver({ infuraProjectId })

const messageHandler = new JwtMessageHandler()
messageHandler.setNext(new W3cMessageHandler()).setNext(new SdrMessageHandler())

const dbConnection = createConnection({
  type: 'sqlite',
  database: './database.sqlite',
  synchronize: true,
  logging: false,
  entities: [...Daf.Entities],
})

export const agent = new Daf.Agent({
  dbConnection,
  identityProviders: [],
  serviceControllers: [],
  didResolver,
  messageHandler,
})

async function getAuthorizedDid(authorization?: string): Promise<string> {
  if (!authorization) throw Error('Format is Authorization: Bearer [token]')
  const parts = authorization.split(' ')
  if (parts.length !== 2) throw Error('Format is Authorization: Bearer [token]')
  const scheme = parts[0]
  if (scheme !== 'Bearer') throw Error('Format is Authorization: Bearer [token]')

  const verified = await verifyJWT(parts[1], { resolver: didResolver })
  //TODO check for specific payload fields. W3C VC or VP should not be a valid
  return verified.issuer
}

const server = new ApolloServer({
  typeDefs: [Daf.Gql.baseTypeDefs, Daf.Gql.Core.typeDefs],
  resolvers: merge(Daf.Gql.Core.resolvers),
  context: async ({ req }) => {
    const authorizedDid = await getAuthorizedDid(req.headers.authorization)
    return { agent, authorizedDid }
  },
  introspection: true,
})

agent.on(Daf.EventTypes.savedMessage, async (message: Daf.Message) => {
  // Add your business logic here
  console.log(message)
})

const main = async () => {
  const info = await server.listen()
  console.log(`🚀  Server ready at ${info.url}`)
}

main().catch(console.log)
