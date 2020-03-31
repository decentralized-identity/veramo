import { DafResolver } from 'daf-resolver'
import { DafUniversalResolver } from 'daf-resolver-universal'

import * as Daf from 'daf-core'
import { JwtMessageHandler } from 'daf-did-jwt'
import * as EthrDid from 'daf-ethr-did'
import * as DafLibSodium from 'daf-libsodium'
import { W3cMessageHandler, W3cActionHandler } from 'daf-w3c'
import { SdrMessageHandler, SdrActionHandler} from 'daf-selective-disclosure'
import { DIDCommMessageHandler, DIDCommActionHandler} from 'daf-did-comm'
import { UrlMessageHandler } from 'daf-url'
import { createConnection } from 'typeorm'
import { DataStore } from 'daf-data-store'

const infuraProjectId = process.env.DAF_INFURA_ID ?? '5ffc47f65c4042ce847ef66a3fa70d4c'

// DID Document Resolver
let didResolver: Daf.Resolver = new DafResolver({
  infuraProjectId,
})

if (process.env.DAF_UNIVERSAL_RESOLVER_URL) {
  didResolver = new DafUniversalResolver({
    url: process.env.DAF_UNIVERSAL_RESOLVER_URL,
  })
}

const identityProviders = [
  new EthrDid.IdentityProvider({
    identityStore: new Daf.IdentityStore('rinkeby-ethr'),
    kms: new DafLibSodium.KeyManagementSystem(new Daf.KeyStore()),
    network: 'rinkeby',
    rpcUrl: 'https://rinkeby.infura.io/v3/' + infuraProjectId,
  }),
]
const serviceControllers: any[] = []

const messageHandler = new UrlMessageHandler()
messageHandler
  .setNext(new DIDCommMessageHandler())
  .setNext(new JwtMessageHandler())
  .setNext(new W3cMessageHandler())
  .setNext(new SdrMessageHandler())

const actionHandler = new DIDCommActionHandler()
actionHandler
  .setNext(new W3cActionHandler())
  .setNext(new SdrActionHandler())

export const core = new Daf.Core({
  identityProviders,
  serviceControllers,
  didResolver,
  messageHandler,
  actionHandler,
})

export const initializeDb = async () => {
  await createConnection({
    type: 'sqlite',
    database: './database.sqlite',
    synchronize: true,
    logging: false,
    entities: [...Daf.Entities],
  })
}

export const dataStore = new DataStore()
