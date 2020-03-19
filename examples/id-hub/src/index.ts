import * as Daf from 'daf-core'
import * as DidJwt from 'daf-did-jwt'
import * as W3c from 'daf-w3c'
import * as SD from 'daf-selective-disclosure'
import * as DBG from 'daf-debug'
import { DafResolver } from 'daf-resolver'
import { ApolloServer } from 'apollo-server'
import merge from 'lodash.merge'
import { createConnection } from 'typeorm'

const infuraProjectId = '5ffc47f65c4042ce847ef66a3fa70d4c'

let didResolver = new DafResolver({ infuraProjectId })

const messageValidator = new DBG.MessageValidator()
messageValidator
  .setNext(new DidJwt.MessageValidator())
  .setNext(new W3c.MessageValidator())
  .setNext(new SD.MessageValidator())

const actionHandler = new DBG.ActionHandler()
actionHandler.setNext(new W3c.ActionHandler()).setNext(new SD.ActionHandler())

export const core = new Daf.Core({
  identityProviders: [],
  serviceControllers: [],
  didResolver,
  messageValidator,
  actionHandler,
})

const server = new ApolloServer({
  typeDefs: [Daf.Gql.baseTypeDefs, Daf.Gql.Core.typeDefs],
  resolvers: merge(Daf.Gql.Core.resolvers),
  context: ({ req }) => {
    const token = req.headers.authorization || ''
    if (token !== 'Bearer hardcoded-example-token') {
      throw Error('Auth error')
    }

    return { core }
  },
  introspection: true,
})

core.on(Daf.EventTypes.savedMessage, async (message: Daf.Message) => {
  // Add your business logic
})

const main = async () => {
  const c = await createConnection({
    type: 'sqlite',
    database: './database.sqlite',
    synchronize: true,
    logging: true,
    entities: [...Daf.Entities],
  })

  const info = await server.listen()
  console.log(`🚀  Server ready at ${info.url}`)
}

main().catch(console.log)
