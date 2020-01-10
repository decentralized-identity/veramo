import * as Daf from 'daf-core'
import * as W3c from 'daf-w3c'
import * as TG from 'daf-trust-graph'
import * as DBG from 'daf-debug'
import * as DidJwt from 'daf-did-jwt'
import { DafUniversalResolver } from 'daf-resolver-universal'
import { EthrDidLocalStorageController } from 'daf-ethr-did-local-storage'
import { EthrDidMetamaskController } from 'daf-ethr-did-metamask'

import Debug from 'debug'
Debug.enable('*')

const messageValidator = new DBG.MessageValidator()
messageValidator.setNext(new DidJwt.MessageValidator()).setNext(new W3c.MessageValidator())

const actionHandler = new DBG.ActionHandler()
actionHandler.setNext(new TG.ActionHandler()).setNext(new W3c.ActionHandler())

const identityControllers: Daf.IdentityController[] = [new EthrDidLocalStorageController()]

if (typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask) {
  EthrDidMetamaskController.snapId = 'http://localhost:8082/package.json'
  identityControllers.push(new EthrDidMetamaskController())
}

export const core = new Daf.Core({
  identityControllers,
  serviceControllers: [],
  didResolver: new DafUniversalResolver({ url: 'https://uniresolver.io/1.0/identifiers/' }),
  messageValidator,
  actionHandler,
})
