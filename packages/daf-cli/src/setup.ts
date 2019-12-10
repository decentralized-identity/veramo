import { DafResolver } from 'daf-resolver'
import { DafUniversalResolver } from 'daf-resolver-universal'

import * as Daf from 'daf-core'
import * as DidJwt from 'daf-did-jwt'
import { EthrDidFsController } from 'daf-ethr-did-fs'

import * as W3c from 'daf-w3c'
import * as SD from 'daf-selective-disclosure'
import * as TG from 'daf-trust-graph'
import * as DBG from 'daf-debug'
import * as DIDComm from 'daf-did-comm'
import * as URL from 'daf-url'

import { NodeSqlite3 } from 'daf-node-sqlite3'
import { DataStore } from 'daf-data-store'
import ws from 'ws'

import Debug from 'debug'
const debug = Debug('main')

const defaultPath = process.env.HOME + '/.daf'

const identityStoreFilename = process.env.DAF_IDENTITY_STORE ?? defaultPath + '/identity-store.json'
const dataStoreFilename = process.env.DAF_DATA_STORE ?? defaultPath + '/data-store-cli.sqlite3'
const infuraProjectId = process.env.DAF_INFURA_ID ?? '5ffc47f65c4042ce847ef66a3fa70d4c'

if (!process.env.DAF_IDENTITY_STORE || process.env.DAF_DATA_STORE || process.env.DAF_ENCRYPTION_STORE) {
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

const identityControllers = [new EthrDidFsController(identityStoreFilename)]

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
  .setNext(
    new TG.ActionHandler({
      uri: process.env.DAF_TG_URI,
    }),
  )
  .setNext(new W3c.ActionHandler())
  .setNext(new SD.ActionHandler())

const serviceControllersWithConfig = [
  {
    controller: TG.TrustGraphServiceController,
    config: {
      uri: process.env.DAF_TG_URI,
      wsUri: process.env.DAF_TG_WSURI,
      webSocketImpl: ws,
    },
  },
]

export const core = new Daf.Core({
  identityControllers,
  serviceControllersWithConfig,
  didResolver,
  messageValidator,
  actionHandler,
})

const db = new NodeSqlite3(dataStoreFilename)
export const dataStore = new DataStore(db)

core.on(Daf.EventTypes.validatedMessage, async (message: Daf.Message) => {
  debug('New message %O', message)
  await dataStore.saveMessage(message)
})
