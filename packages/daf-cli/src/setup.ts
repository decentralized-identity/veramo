import { DafResolver } from 'daf-resolver'
import { DafUniversalResolver } from 'daf-resolver-universal'

import * as Daf from 'daf-core'
import { JwtMessageHandler } from 'daf-did-jwt'
import * as EthrDid from 'daf-ethr-did'
import { KeyManagementSystem, SecretBox } from 'daf-libsodium'

import { W3cActionHandler, W3cMessageHandler } from 'daf-w3c'
import { SdrActionHandler, SdrMessageHandler } from 'daf-selective-disclosure'
import { TrustGraphActionHandler, TrustGraphServiceController } from 'daf-trust-graph'
import { DIDCommActionHandler, DIDCommMessageHandler } from 'daf-did-comm'
import { UrlMessageHandler } from 'daf-url'
import { createConnection } from 'typeorm'
import { migrations } from './migrations'
const fs = require('fs')
import ws from 'ws'
import { config } from 'dotenv'

const defaultPath = process.env.HOME + '/.daf/'
const envFile = defaultPath + '.env'

const writeDefaultConfig = async () => {
  if (!fs.existsSync(defaultPath)) {
    fs.mkdirSync(defaultPath)
  }

  if (!fs.existsSync(envFile)) {
    console.log('Configuration file does not exist. Creating: ' + envFile)
    let env = 'DAF_DATA_STORE=' + defaultPath + 'database-v2.sqlite'
    env += '\nDAF_DEBUG_DB=false'
    env += '\nDAF_SECRET_KEY=' + (await SecretBox.createSecretKey())
    env += '\nDAF_INFURA_ID=5ffc47f65c4042ce847ef66a3fa70d4c'
    env += '\n#DEBUG=daf:*'

    fs.writeFileSync(envFile, env)
  }
}

const setupAgent = async (): Promise<Daf.Agent> => {
  await writeDefaultConfig()
  config({ path: envFile })

  const infuraProjectId = process.env.DAF_INFURA_ID

  // DID Document Resolver
  let didResolver: Daf.Resolver = new DafResolver({
    infuraProjectId,
  })

  if (process.env.DAF_UNIVERSAL_RESOLVER_URL) {
    didResolver = new DafUniversalResolver({
      url: process.env.DAF_UNIVERSAL_RESOLVER_URL,
    })
  }

  if (process.env.DAF_TG_URI) TrustGraphServiceController.defaultUri = process.env.DAF_TG_URI
  if (process.env.DAF_TG_WSURI) TrustGraphServiceController.defaultWsUri = process.env.DAF_TG_WSURI
  TrustGraphServiceController.webSocketImpl = ws

  const synchronize = !fs.existsSync(process.env.DAF_DATA_STORE)

  const dbConnection = createConnection({
    type: 'sqlite',
    migrationsRun: true,
    synchronize,
    database: process.env.DAF_DATA_STORE,
    logging: process.env.DAF_DEBUG_DB === 'true' ? true : false,
    entities: [...Daf.Entities],
    migrations: [...Daf.migrations, ...migrations],
  })

  const identityProviders = [
    new EthrDid.IdentityProvider({
      identityStore: new Daf.IdentityStore('rinkeby-ethr', dbConnection),
      kms: new KeyManagementSystem(new Daf.KeyStore(dbConnection, new SecretBox(process.env.DAF_SECRET_KEY))),
      network: 'rinkeby',
      rpcUrl: 'https://rinkeby.infura.io/v3/' + infuraProjectId,
      gas: 10001,
      ttl: 60 * 60 * 24 * 30 * 12 + 1,
    }),
  ]
  const serviceControllers = [TrustGraphServiceController]

  const messageHandler = new UrlMessageHandler()
  messageHandler
    .setNext(new DIDCommMessageHandler())
    .setNext(new JwtMessageHandler())
    .setNext(new W3cMessageHandler())
    .setNext(new SdrMessageHandler())

  const actionHandler = new DIDCommActionHandler()
  actionHandler
    .setNext(new TrustGraphActionHandler())
    .setNext(new W3cActionHandler())
    .setNext(new SdrActionHandler())

  const agent = new Daf.Agent({
    dbConnection,
    identityProviders,
    serviceControllers,
    didResolver,
    messageHandler,
    actionHandler,
  })
  return agent
}

export const agent = setupAgent()
