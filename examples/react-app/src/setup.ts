import * as Daf from 'daf-core'
import { W3cActionHandler, W3cMessageHandler } from 'daf-w3c'
import { TrustGraphActionHandler } from 'daf-trust-graph'
import { JwtMessageHandler } from 'daf-did-jwt'
import { DafResolver } from 'daf-resolver'
import * as EthrDid from 'daf-ethr-did'
import * as DafLocalStorage from 'daf-local-storage'
import * as DafLibSodium from 'daf-libsodium'
// import * as MM from 'daf-ethr-did-metamask'

import Debug from 'debug'
Debug.enable('*')

const messageHandler = new JwtMessageHandler()
messageHandler.setNext(new W3cMessageHandler())

const actionHandler = new TrustGraphActionHandler()
actionHandler.setNext(new W3cActionHandler())

const infuraProjectId = '5ffc47f65c4042ce847ef66a3fa70d4c'

const didResolver = new DafResolver({ infuraProjectId })

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

export const agent = new Daf.Agent({
  identityProviders,
  serviceControllers: [],
  didResolver,
  messageHandler,
  actionHandler,
})
