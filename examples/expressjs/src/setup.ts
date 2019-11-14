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
import { SodiumFsEncryptionKeyManager } from 'daf-sodium-fs'

import { NodeSqlite3 } from 'daf-node-sqlite3'
import { DataStore, Gql as DataGql } from 'daf-data-store'
import ws from 'ws'

import Debug from 'debug'
const debug = Debug('main')

const defaultPath = process.env.HOME + '/.daf'

const identityStoreFilename = process.env.DAF_IDENTITY_STORE ?? defaultPath + '/identity-store.json'
const dataStoreFilename = process.env.DAF_DATA_STORE ?? defaultPath + '/data-store.sqlite3'
const encryptionStoreFilename = process.env.DAF_ENCRYPTION_STORE ?? defaultPath + '/encryption-store.json'
const infuraProjectId = process.env.DAF_INFURA_ID ?? '5ffc47f65c4042ce847ef66a3fa70d4c'

if (!process.env.DAF_IDENTITY_STORE || process.env.DAF_DATA_STORE || process.env.DAF_ENCRYPTION_STORE) {
  const fs = require('fs')
  if (!fs.existsSync(defaultPath)) {
    fs.mkdirSync(defaultPath)
  }
}

// DID Document Resolver
let didResolver: Daf.Resolver = new DafResolver({
  infuraProjectId
})

if (process.env.DAF_UNIVERSAL_RESOLVER_URL) {
  didResolver = new DafUniversalResolver({
    url: process.env.DAF_UNIVERSAL_RESOLVER_URL
  })
}

const identityControllers = [new EthrDidFsController(identityStoreFilename)]

const messageValidator = new DBG.MessageValidator()
messageValidator
  .setNext(new DIDComm.MessageValidator())
  .setNext(
    new DidJwt.MessageValidator({
      payloadValidators: [
        new W3c.PayloadValidator(),
        new SD.PayloadValidator(),
      ],
    }),
  )

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
  // { controller: Rnd.RandomMessageService, config: {}},
  {
    controller: TG.TrustGraphServiceController,
    config: {
      uri: process.env.DAF_TG_URI,
      wsUri: process.env.DAF_TG_WSURI,
      webSocketImpl: ws,
    },
  },
]

const encryptionKeyManager = new SodiumFsEncryptionKeyManager(encryptionStoreFilename)

export const core = new Daf.Core({
  identityControllers,
  serviceControllersWithConfig,
  didResolver,
  messageValidator,
  actionHandler,
  encryptionKeyManager
})

const db = new NodeSqlite3(dataStoreFilename)
export const dataStore = new DataStore(db)


const { ApolloServer } = require('apollo-server-express')
import merge from 'lodash.merge'

export const apolloServer = new ApolloServer({
  typeDefs: [
    Daf.Gql.baseTypeDefs,
    Daf.Gql.Core.typeDefs,
    Daf.Gql.IdentityManager.typeDefs,
    DataGql.typeDefs,
    DIDComm.Gql.typeDefs,
    W3c.Gql.typeDefs,
  ],
  resolvers: merge(
    Daf.Gql.Core.resolvers,
    Daf.Gql.IdentityManager.resolvers,
    DataGql.resolvers,
    DIDComm.Gql.resolvers,
    W3c.Gql.resolvers,
  ),
  context: () => ({ dataStore, core }),
  introspection: true,
  graphqlPath: '/graphql',
})