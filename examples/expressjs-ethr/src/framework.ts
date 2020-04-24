import { DafResolver } from 'daf-resolver'
import { DafUniversalResolver } from 'daf-resolver-universal'

import * as Daf from 'daf-core'
import { JwtMessageHandler } from 'daf-did-jwt'
import * as EthrDid from 'daf-ethr-did'
import { KeyManagementSystem, SecretBox } from 'daf-libsodium'
import { W3cMessageHandler, W3cActionHandler } from 'daf-w3c'
import { SdrMessageHandler, SdrActionHandler } from 'daf-selective-disclosure'
import { DIDCommMessageHandler, DIDCommActionHandler } from 'daf-did-comm'
import { UrlMessageHandler } from 'daf-url'
import { createConnection } from 'typeorm'

const infuraProjectId = '5ffc47f65c4042ce847ef66a3fa70d4c'
// Generate this by running `npx daf-cli crypto -s`
const secretKey = '29739248cad1bd1a0fc4d9b75cd4d2990de535baf5caadfdf8d8f86664aa830c'

// DID Document Resolver
let didResolver: Daf.Resolver = new DafResolver({
  infuraProjectId,
})

if (process.env.DAF_UNIVERSAL_RESOLVER_URL) {
  didResolver = new DafUniversalResolver({
    url: process.env.DAF_UNIVERSAL_RESOLVER_URL,
  })
}

const dbConnection = createConnection({
  type: 'sqlite',
  database: './database.sqlite',
  synchronize: true,
  logging: false,
  entities: [...Daf.Entities],
})

const identityProviders = [
  new EthrDid.IdentityProvider({
    identityStore: new Daf.IdentityStore('rinkeby-ethr', dbConnection),
    kms: new KeyManagementSystem(new Daf.KeyStore(dbConnection, new SecretBox(secretKey))),
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
actionHandler.setNext(new W3cActionHandler()).setNext(new SdrActionHandler())

export const agent = new Daf.Agent({
  dbConnection,
  identityProviders,
  serviceControllers,
  didResolver,
  messageHandler,
  actionHandler,
})
