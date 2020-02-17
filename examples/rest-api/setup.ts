import * as Daf from 'daf-core'
import * as DafEthr from 'daf-ethr-did'
import * as DafFs from 'daf-fs'
import * as DafLibSodium from 'daf-libsodium'
import * as W3c from 'daf-w3c'
import * as DBG from 'daf-debug'
import * as DidJwt from 'daf-did-jwt'
import * as DidComm from 'daf-did-comm'
import { DafResolver } from 'daf-resolver'

import Debug from 'debug'
Debug.enable('*')

const messageValidator = new DBG.MessageValidator()
messageValidator.setNext(new DidJwt.MessageValidator()).setNext(new W3c.MessageValidator())

const actionHandler = new DBG.ActionHandler()
actionHandler.setNext(new DidComm.ActionHandler()).setNext(new W3c.ActionHandler())

const infuraProjectId = '5ffc47f65c4042ce847ef66a3fa70d4c'

const didResolver = new DafResolver({ infuraProjectId })

export const core = new Daf.Core({
  identityProviders: [
    new DafEthr.IdentityProvider({
      kms: new DafLibSodium.KeyManagementSystem(new DafFs.KeyStore('./key-store.json')),
      identityStore: new DafFs.IdentityStore('./identity-store.json'),
      network: 'rinkeby',
      rpcUrl: 'https://rinkeby.infura.io/v3/' + infuraProjectId,
      resolver: didResolver,
    }),
  ],
  serviceControllers: [],
  didResolver,
  messageValidator,
  actionHandler,
})
