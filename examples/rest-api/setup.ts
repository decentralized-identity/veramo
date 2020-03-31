import * as Daf from 'daf-core'
import * as DafEthr from 'daf-ethr-did'
import * as DafLibSodium from 'daf-libsodium'
import { W3cActionHandler, W3cMessageHandler} from 'daf-w3c'
import { JwtMessageHandler } from 'daf-did-jwt'
import { DIDCommActionHandler, DIDCommMessageHandler} from 'daf-did-comm'
import { DafResolver } from 'daf-resolver'

import Debug from 'debug'
Debug.enable('*')

const messageHandler = new JwtMessageHandler()
messageHandler.setNext(new W3cMessageHandler())

const actionHandler = new DIDCommActionHandler()
actionHandler.setNext(new W3cActionHandler())

const infuraProjectId = '5ffc47f65c4042ce847ef66a3fa70d4c'

const didResolver = new DafResolver({ infuraProjectId })

export const core = new Daf.Core({
  identityProviders: [
    new DafEthr.IdentityProvider({
      kms: new DafLibSodium.KeyManagementSystem(new Daf.KeyStore()),
      identityStore: new Daf.IdentityStore('rinkeby-ethr'),
      network: 'rinkeby',
      rpcUrl: 'https://rinkeby.infura.io/v3/' + infuraProjectId,
    }),
  ],
  serviceControllers: [],
  didResolver,
  messageHandler,
  actionHandler,
})
