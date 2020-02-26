import * as Daf from 'daf-core'
import * as DS from 'daf-data-store'
import * as DidJwt from 'daf-did-jwt'
import * as W3c from 'daf-w3c'
import * as SD from 'daf-selective-disclosure'
import * as TG from 'daf-trust-graph'
import * as DBG from 'daf-debug'
import * as URL from 'daf-url'
import { NodeSqlite3 } from 'daf-node-sqlite3'
import * as DafEthrDid from 'daf-ethr-did'
import * as DafFs from 'daf-fs'
import * as DafLibSodium from 'daf-libsodium'
import { DafResolver } from 'daf-resolver'
import { ApolloServer } from 'apollo-server'
import merge from 'lodash.merge'
import ws from 'ws'

TG.ServiceController.webSocketImpl = ws
const infuraProjectId = '5ffc47f65c4042ce847ef66a3fa70d4c'

let didResolver = new DafResolver({ infuraProjectId })

const identityProviders = [
  new DafEthrDid.IdentityProvider({
    kms: new DafLibSodium.KeyManagementSystem(new DafFs.KeyStore('./key-store.json')),
    identityStore: new DafFs.IdentityStore('./identity-store.json'),
    network: 'rinkeby',
    rpcUrl: 'https://rinkeby.infura.io/v3/' + infuraProjectId,
  }),
]
const serviceControllers = [TG.ServiceController]

const messageValidator = new DBG.MessageValidator()
messageValidator
  .setNext(new URL.MessageValidator())
  .setNext(new DidJwt.MessageValidator())
  .setNext(new W3c.MessageValidator())
  .setNext(new SD.MessageValidator())

const actionHandler = new DBG.ActionHandler()
actionHandler
  .setNext(new TG.ActionHandler())
  .setNext(new W3c.ActionHandler())
  .setNext(new SD.ActionHandler())

export const core = new Daf.Core({
  identityProviders,
  serviceControllers,
  didResolver,
  messageValidator,
  actionHandler,
})

const dataStore = new DS.DataStore(new NodeSqlite3('./data-store.sqlite3'))

const server = new ApolloServer({
  typeDefs: [
    Daf.Gql.baseTypeDefs,
    DS.Gql.typeDefs,
    Daf.Gql.Core.typeDefs,
    Daf.Gql.IdentityManager.typeDefs,
    TG.Gql.typeDefs,
    W3c.Gql.typeDefs,
    SD.Gql.typeDefs,
  ],
  resolvers: merge(
    Daf.Gql.Core.resolvers,
    Daf.Gql.IdentityManager.resolvers,
    DS.Gql.resolvers,
    TG.Gql.resolvers,
    W3c.Gql.resolvers,
    SD.Gql.resolvers,
  ),
  context: ({ req }) => {
    // Authorization is out of scope for this example,
    // but this is where you could add your auth logic
    const token = req.headers.authorization || ''
    if (token !== 'Bearer hardcoded-example-token') {
      throw Error('Auth error')
    }

    return { core, dataStore }
  },
  introspection: true,
})

core.on(Daf.EventTypes.validatedMessage, async (message: Daf.Message) => {
  await dataStore.saveMessage(message)
})

const main = async () => {
  await dataStore.initialize()
  await core.setupServices()
  await core.listen()
  const info = await server.listen()
  console.log(`🚀  Server ready at ${info.url}`)
}

main().catch(console.log)
