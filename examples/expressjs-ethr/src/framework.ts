import { DafResolver } from 'daf-resolver'
import { DafUniversalResolver } from 'daf-resolver-universal'

import * as Daf from 'daf-core'
import * as DidJwt from 'daf-did-jwt'
import * as EthrDid from 'daf-ethr-did'
import * as DafLibSodium from 'daf-libsodium'
import * as DafFs from 'daf-fs'

import * as W3c from 'daf-w3c'
import * as SD from 'daf-selective-disclosure'
import * as DBG from 'daf-debug'
import * as DIDComm from 'daf-did-comm'
import * as URL from 'daf-url'
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
    identityStore: new Daf.IdentityStore(),
    kms: new DafLibSodium.KeyManagementSystem(new Daf.KeyStore()),
    network: 'rinkeby',
    rpcUrl: 'https://rinkeby.infura.io/v3/' + infuraProjectId,
  }),
]
const serviceControllers: any[] = []

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
    database: './database.sqlite',
    synchronize: true,
    logging: false,
    entities: [
      Daf.Key,
      Daf.Identity,
      Daf.Message,
      Daf.MessageMetaData,
      Daf.Credential,
      Daf.Presentation,
      Daf.Claim,
    ],
  })
}

export const dataStore = new DataStore()
