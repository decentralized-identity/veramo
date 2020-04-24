import * as Daf from 'daf-core'
import { JwtMessageHandler } from 'daf-did-jwt'
import { DIDCommActionHandler, DIDCommMessageHandler, DIDCommGql } from 'daf-did-comm'
import { W3cMessageHandler, W3cActionHandler, W3cGql } from 'daf-w3c'
import { SdrMessageHandler, SdrActionHandler, SdrGql } from 'daf-selective-disclosure'
import * as DafEthrDid from 'daf-ethr-did'
import { KeyManagementSystem, SecretBox } from 'daf-libsodium'
import { DafResolver } from 'daf-resolver'
import { ApolloServer } from 'apollo-server'
import merge from 'lodash.merge'
import { createConnection } from 'typeorm'

const infuraProjectId = '5ffc47f65c4042ce847ef66a3fa70d4c'
// Generate this by running `npx daf-cli crypto -s`
const secretKey = '29739248cad1bd1a0fc4d9b75cd4d2990de535baf5caadfdf8d8f86664aa830c'


let didResolver = new DafResolver({ infuraProjectId })

const dbConnection = createConnection({
  type: 'sqlite',
  database: './database.sqlite',
  synchronize: true,
  logging: false,
  entities: [...Daf.Entities],
})

const identityProviders = [
  new DafEthrDid.IdentityProvider({
    kms: new KeyManagementSystem(new Daf.KeyStore(dbConnection, new SecretBox(secretKey))),
    identityStore: new Daf.IdentityStore('rinkeby-ethr', dbConnection),
    network: 'rinkeby',
    rpcUrl: 'https://rinkeby.infura.io/v3/' + infuraProjectId,
  }),
]

const messageHandler = new DIDCommMessageHandler()
messageHandler
  .setNext(new JwtMessageHandler())
  .setNext(new W3cMessageHandler())
  .setNext(new SdrMessageHandler())

const actionHandler = new DIDCommActionHandler()
actionHandler.setNext(new W3cActionHandler()).setNext(new SdrActionHandler())

export const agent = new Daf.Agent({
  dbConnection,
  identityProviders,
  didResolver,
  messageHandler,
  actionHandler,
})

const server = new ApolloServer({
  typeDefs: [
    Daf.Gql.baseTypeDefs,
    Daf.Gql.Core.typeDefs,
    Daf.Gql.IdentityManager.typeDefs,
    DIDCommGql.typeDefs,
    W3cGql.typeDefs,
    SdrGql.typeDefs,
  ],
  resolvers: merge(
    Daf.Gql.Core.resolvers,
    Daf.Gql.IdentityManager.resolvers,
    DIDCommGql.resolvers,
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

    return { agent }
  },
  introspection: true,
})

const main = async () => {
  const info = await server.listen()
  console.log(`🚀  Server ready at ${info.url}`)
}

main().catch(console.log)
