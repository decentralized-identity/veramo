import * as Daf from 'daf-core'
import * as DS from 'daf-data-store'
import { JwtMessageHandler } from 'daf-did-jwt'
import { W3cMessageHandler, W3cActionHandler, W3cGql } from 'daf-w3c'
import { SdrMessageHandler, SdrActionHandler, SdrGql } from 'daf-selective-disclosure'
import { TrustGraphServiceController, TrustGraphGql, TrustGraphActionHandler } from 'daf-trust-graph'
import { UrlMessageHandler } from 'daf-url'
import * as DafEthrDid from 'daf-ethr-did'
import * as DafLibSodium from 'daf-libsodium'
import { DafResolver } from 'daf-resolver'
import { ApolloServer } from 'apollo-server'
import merge from 'lodash.merge'
import ws from 'ws'
import { createConnection } from 'typeorm'

TrustGraphServiceController.webSocketImpl = ws
const infuraProjectId = '5ffc47f65c4042ce847ef66a3fa70d4c'

let didResolver = new DafResolver({ infuraProjectId })

const identityProviders = [
  new DafEthrDid.IdentityProvider({
    kms: new DafLibSodium.KeyManagementSystem(new Daf.KeyStore()),
    identityStore: new Daf.IdentityStore('rinkeby-ethr'),
    network: 'rinkeby',
    rpcUrl: 'https://rinkeby.infura.io/v3/' + infuraProjectId,
  }),
]
const serviceControllers = [TrustGraphServiceController]

const messageHandler = new UrlMessageHandler()
messageHandler
  .setNext(new JwtMessageHandler())
  .setNext(new W3cMessageHandler())
  .setNext(new SdrMessageHandler())

const actionHandler = new TrustGraphActionHandler()
actionHandler.setNext(new W3cActionHandler()).setNext(new SdrActionHandler())

export const agent = new Daf.Agent({
  identityProviders,
  serviceControllers,
  didResolver,
  messageHandler,
  actionHandler,
})

const dataStore = new DS.DataStore()

const server = new ApolloServer({
  typeDefs: [
    Daf.Gql.baseTypeDefs,
    Daf.Gql.Core.typeDefs,
    Daf.Gql.IdentityManager.typeDefs,
    TrustGraphGql.typeDefs,
    W3cGql.typeDefs,
    SdrGql.typeDefs,
  ],
  resolvers: merge(
    Daf.Gql.Core.resolvers,
    Daf.Gql.IdentityManager.resolvers,
    TrustGraphGql.resolvers,
    W3cGql.resolvers,
    SdrGql.resolvers,
  ),
  context: ({ req }) => {
    // Authorization is out of scope for this example,
    // but this is where you could add your auth logic
    const token = req.headers.authorization || ''
    if (token !== 'Bearer hardcoded-example-token') {
      throw Error('Auth error')
    }

    return { agent, dataStore }
  },
  introspection: true,
})

const main = async () => {
  await createConnection({
    type: 'sqlite',
    database: './database.sqlite',
    synchronize: true,
    logging: false,
    entities: [...Daf.Entities],
  })

  await agent.setupServices()
  await agent.listen()
  const info = await server.listen()
  console.log(`🚀  Server ready at ${info.url}`)
}

main().catch(console.log)
