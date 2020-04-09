import { DafResolver } from 'daf-resolver'
import { DafUniversalResolver } from 'daf-resolver-universal'

import * as Daf from 'daf-core'
import { JwtMessageHandler } from 'daf-did-jwt'
import * as EthrDid from 'daf-ethr-did'
import * as DafLibSodium from 'daf-libsodium'

import { W3cActionHandler, W3cMessageHandler } from 'daf-w3c'
import { SdrActionHandler, SdrMessageHandler } from 'daf-selective-disclosure'
import { TrustGraphActionHandler, TrustGraphServiceController } from 'daf-trust-graph'
import { DIDCommActionHandler, DIDCommMessageHandler } from 'daf-did-comm'
import { UrlMessageHandler } from 'daf-url'
import { createConnection } from 'typeorm'

import { DataStore } from 'daf-data-store'
import ws from 'ws'

const defaultPath = process.env.HOME + '/.daf/'

const dataStoreFilename = process.env.DAF_DATA_STORE ?? defaultPath + 'database-v2.sqlite'
const infuraProjectId = process.env.DAF_INFURA_ID ?? '5ffc47f65c4042ce847ef66a3fa70d4c'

if (!process.env.DAF_IDENTITY_STORE || process.env.DAF_DATA_STORE) {
  const fs = require('fs')
  if (!fs.existsSync(defaultPath)) {
    fs.mkdirSync(defaultPath)
  }
}

// DID Document Resolver
let didResolver: Daf.Resolver = new DafResolver({
  infuraProjectId,
})

if (process.env.DAF_UNIVERSAL_RESOLVER_URL) {
  didResolver = new DafUniversalResolver({
    url: process.env.DAF_UNIVERSAL_RESOLVER_URL,
  })
}

if (process.env.DAF_TG_URI) TrustGraphServiceController.defaultUri = process.env.DAF_TG_URI
if (process.env.DAF_TG_WSURI) TrustGraphServiceController.defaultWsUri = process.env.DAF_TG_WSURI
TrustGraphServiceController.webSocketImpl = ws

const dbConnection = createConnection({
  type: 'sqlite',
  database: dataStoreFilename,
  synchronize: true,
  logging: process.env.DEBUG_DAF_DB ? true : false,
  entities: [...Daf.Entities],
})

const identityProviders = [
  new EthrDid.IdentityProvider({
    identityStore: new Daf.IdentityStore('rinkeby-ethr', dbConnection),
    kms: new DafLibSodium.KeyManagementSystem(new Daf.KeyStore(dbConnection)),
    network: 'rinkeby',
    rpcUrl: 'https://rinkeby.infura.io/v3/' + infuraProjectId,
  }),
]
const serviceControllers = [TrustGraphServiceController]

const messageHandler = new UrlMessageHandler()
messageHandler
  .setNext(new DIDCommMessageHandler())
  .setNext(new JwtMessageHandler())
  .setNext(new W3cMessageHandler())
  .setNext(new SdrMessageHandler())

const actionHandler = new DIDCommActionHandler()
actionHandler
  .setNext(new TrustGraphActionHandler())
  .setNext(new W3cActionHandler())
  .setNext(new SdrActionHandler())

export const agent = new Daf.Agent({
  dbConnection,
  identityProviders,
  serviceControllers,
  didResolver,
  messageHandler,
  actionHandler,
})

export const dataStore = new DataStore()
