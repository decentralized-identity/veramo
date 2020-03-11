import { DafResolver } from 'daf-resolver'
import { DafUniversalResolver } from 'daf-resolver-universal'

import * as Daf from 'daf-core'
import * as DidJwt from 'daf-did-jwt'
import * as EthrDid from 'daf-ethr-did'
import * as DafFs from 'daf-fs'
import * as DafLibSodium from 'daf-libsodium'

import * as W3c from 'daf-w3c'
import * as SD from 'daf-selective-disclosure'
import * as TG from 'daf-trust-graph'
import * as DBG from 'daf-debug'
import * as DIDComm from 'daf-did-comm'
import * as URL from 'daf-url'
import { createConnection } from 'typeorm'

import { DataStore } from 'daf-data-store'
import ws from 'ws'

import Debug from 'debug'
const debug = Debug('daf:cli')

const defaultPath = process.env.HOME + '/.daf/'

const dataStoreFilename = process.env.DAF_DATA_STORE ?? defaultPath + 'data-store-cli.sqlite3'
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

if (process.env.DAF_TG_URI) TG.ServiceController.defaultUri = process.env.DAF_TG_URI
if (process.env.DAF_TG_WSURI) TG.ServiceController.defaultWsUri = process.env.DAF_TG_WSURI
TG.ServiceController.webSocketImpl = ws

const identityProviders = [
  new EthrDid.IdentityProvider({
    identityStore: new DafFs.IdentityStore(defaultPath + '/rinkeby-identity-store.json'),
    kms: new DafLibSodium.KeyManagementSystem(new DafFs.KeyStore(defaultPath + '/rinkeby-kms.json')),
    network: 'rinkeby',
    rpcUrl: 'https://rinkeby.infura.io/v3/' + infuraProjectId,
  }),
]
const serviceControllers = [TG.ServiceController]

const messageValidator = new DBG.MessageValidator()
messageValidator
  .setNext(new URL.MessageValidator())
  .setNext(new DIDComm.MessageValidator())
  .setNext(new DidJwt.MessageValidator())
  .setNext(new W3c.MessageValidator())
  .setNext(new SD.MessageValidator())

const actionHandler = new DBG.ActionHandler()
actionHandler
  .setNext(new DIDComm.ActionHandler())
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

export const initializeDb = async () => {
  await createConnection({
    type: 'sqlite',
    database: defaultPath + 'database-v2.sqlite',
    synchronize: true,
    logging: true,
    entities: [...Daf.Entities],
  })
}
export const dataStore = new DataStore()

core.on(Daf.EventTypes.validatedMessage, async (message: Daf.Message) => {
  debug('New message %O', message)
  await message.save()
})
