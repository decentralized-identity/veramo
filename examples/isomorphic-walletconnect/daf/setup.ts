import * as Daf from 'daf-core'
import * as DS from 'daf-data-store'
import * as DidJwt from 'daf-did-jwt'
import * as W3c from 'daf-w3c'
import * as SD from 'daf-selective-disclosure'
import * as TG from 'daf-trust-graph'
import * as DBG from 'daf-debug'
import * as URL from 'daf-url'
import * as DafEthrDid from 'daf-ethr-did'
import * as DafLibSodium from 'daf-libsodium'
import { DafResolver } from 'daf-resolver'
import { createConnection } from 'typeorm'

const infuraProjectId = '5ffc47f65c4042ce847ef66a3fa70d4c'

let didResolver = new DafResolver({ infuraProjectId })

const identityProviders = [
  new DafEthrDid.IdentityProvider({
    kms: new DafLibSodium.KeyManagementSystem(new Daf.KeyStore()),
    identityStore: new Daf.IdentityStore('rinkeby-ethr'),
    network: 'rinkeby',
    rpcUrl: 'https://rinkeby.infura.io/v3/' + infuraProjectId,
  }),
]
const serviceControllers = []

const messageValidator = new DBG.MessageValidator()
messageValidator
  .setNext(new URL.MessageValidator())
  .setNext(new DidJwt.MessageValidator())
  .setNext(new W3c.MessageValidator())
  .setNext(new SD.MessageValidator())

const actionHandler = new DBG.ActionHandler()
actionHandler
  .setNext(new TG.ActionHandler())
  .setNext(new W3c.ActionHandler())
  .setNext(new SD.ActionHandler())

export const dataStore = new DS.DataStore()
export const core = new Daf.Core({
  identityProviders,
  serviceControllers,
  didResolver,
  messageValidator,
  actionHandler,
})

core.on(Daf.EventTypes.validatedMessage, async (message: Daf.Message) => {
  await message.save()
})

export const main = async () => {
  await createConnection({
    type: 'sqlite',
    database: './database.sqlite',
    synchronize: true,
    logging: true,
    entities: [...Daf.Entities],
  })

  await core.setupServices()
  await core.listen()
}

main().catch(console.log)
