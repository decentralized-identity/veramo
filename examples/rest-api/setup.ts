import * as Daf from 'daf-core'
import * as DafEthr from 'daf-ethr-did'
import { KeyManagementSystem, SecretBox } from 'daf-libsodium'
import { W3cActionHandler, W3cMessageHandler } from 'daf-w3c'
import { JwtMessageHandler } from 'daf-did-jwt'
import { DIDCommActionHandler, DIDCommMessageHandler } from 'daf-did-comm'
import { DafResolver } from 'daf-resolver'
import { createConnection } from 'typeorm'

import Debug from 'debug'
Debug.enable('*')

const messageHandler = new DIDCommMessageHandler()
messageHandler.setNext(new JwtMessageHandler()).setNext(new W3cMessageHandler())

const actionHandler = new DIDCommActionHandler()
actionHandler.setNext(new W3cActionHandler())

const infuraProjectId = '5ffc47f65c4042ce847ef66a3fa70d4c'
// Generate this by running `npx daf-cli crypto -s`
const secretKey = '29739248cad1bd1a0fc4d9b75cd4d2990de535baf5caadfdf8d8f86664aa830c'

const didResolver = new DafResolver({ infuraProjectId })

const dbConnection = createConnection({
  type: 'sqlite',
  database: './database.sqlite',
  synchronize: true,
  logging: true,
  entities: Daf.Entities,
})

export const agent = new Daf.Agent({
  dbConnection,
  identityProviders: [
    new DafEthr.IdentityProvider({
      kms: new KeyManagementSystem(new Daf.KeyStore(dbConnection, new SecretBox(secretKey))),
      identityStore: new Daf.IdentityStore('rinkeby-ethr', dbConnection),
      network: 'rinkeby',
      rpcUrl: 'https://rinkeby.infura.io/v3/' + infuraProjectId,
    }),
  ],
  serviceControllers: [],
  didResolver,
  messageHandler,
  actionHandler,
})
