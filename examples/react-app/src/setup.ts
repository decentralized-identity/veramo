import * as Daf from 'daf-core'
import * as W3c from 'daf-w3c'
import * as TG from 'daf-trust-graph'
import * as DBG from 'daf-debug'
import * as DidJwt from 'daf-did-jwt'
import { DafUniversalResolver } from 'daf-resolver-universal'
import * as EthrDid from 'daf-ethr-did'
import * as DafLocalStorage from 'daf-local-storage'
import * as DafLibSodium from 'daf-libsodium'
// import * as MM from 'daf-ethr-did-metamask'

import Debug from 'debug'
Debug.enable('*')

const messageValidator = new DBG.MessageValidator()
messageValidator.setNext(new DidJwt.MessageValidator()).setNext(new W3c.MessageValidator())

const actionHandler = new DBG.ActionHandler()
actionHandler.setNext(new TG.ActionHandler()).setNext(new W3c.ActionHandler())

const didResolver = new DafUniversalResolver({ url: 'https://uniresolver.io/1.0/identifiers/' })

const infuraProjectId = '5ffc47f65c4042ce847ef66a3fa70d4c'

const identityProviders: Daf.AbstractIdentityProvider[] = [
  new EthrDid.IdentityProvider({
    kms: new DafLibSodium.KeyManagementSystem(new DafLocalStorage.KeyStore('localKeys')),
    identityStore: new DafLocalStorage.IdentityStore('localIdentities'),
    network: 'rinkeby',
    rpcUrl: 'https://rinkeby.infura.io/v3/' + infuraProjectId,
  }),
]

// if (typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask) {
//   MM.IdentityProvider.snapId = 'http://localhost:8082/package.json'
//   identityProviders.push(new MM.IdentityProvider())
// }

export const core = new Daf.Core({
  identityProviders,
  serviceControllers: [],
  didResolver,
  messageValidator,
  actionHandler,
})
