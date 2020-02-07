import * as Daf from 'daf-core'
import * as DidJwt from 'daf-did-jwt'
import * as W3c from 'daf-w3c'
import * as SD from 'daf-selective-disclosure'
import * as TG from 'daf-trust-graph'
import * as DBG from 'daf-debug'
import * as URL from 'daf-url'

import { Resolver } from 'did-resolver'
import { getResolver as ethrDidResolver } from 'ethr-did-resolver'
import { getResolver as webDidResolver } from 'web-did-resolver'
import EthrDidRnController from 'daf-ethr-did-react-native'

import RnSqlite from 'daf-react-native-sqlite3'
import { DataStore } from 'daf-data-store'

const web = webDidResolver()
const didResolver = new Resolver({
  ...ethrDidResolver({
    rpcUrl: 'https://mainnet.infura.io/v3/5ffc47f65c4042ce847ef66a3fa70d4c',
  }),
  ...web,
  https: web.web,
})

const identityControllers = [new EthrDidRnController()]

const messageValidator = new DBG.MessageValidator()
messageValidator
  .setNext(new URL.MessageValidator())
  .setNext(new DidJwt.MessageValidator())
  .setNext(new W3c.MessageValidator())
  .setNext(new SD.MessageValidator())

const actionHandler = new DBG.ActionHandler()
actionHandler.setNext(new W3c.ActionHandler()).setNext(new SD.ActionHandler())

const serviceControllers: any = []

export const core = new Daf.Core({
  identityControllers,
  serviceControllers,
  didResolver,
  messageValidator,
  actionHandler,
})

export const db = new RnSqlite('database.sqlite3')
export const dataStore = new DataStore(db)
