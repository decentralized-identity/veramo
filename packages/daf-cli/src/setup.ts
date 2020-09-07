import { DafResolver } from 'daf-resolver'
import { DafUniversalResolver } from 'daf-resolver-universal'

import * as Daf from 'daf-core'
import { JwtMessageHandler } from 'daf-did-jwt'
import * as EthrDid from 'daf-ethr-did'
import * as WebDid from 'daf-web-did'
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
import { getConfiguration } from './config'

const defaultPath = process.env.HOME + '/.daf/'
const envFile = defaultPath + '.env'

const writeDefaultEnv = async () => {
  if (!fs.existsSync(defaultPath)) {
    fs.mkdirSync(defaultPath)
  }

  if (!fs.existsSync(envFile)) {
    let env = 'DAF_DATA_STORE=' + defaultPath + 'database-v2.sqlite'
    env += '\nDAF_DEBUG_DB=false'
    env += '\nDAF_SECRET_KEY=' + (await SecretBox.createSecretKey())
    env += '\nDAF_INFURA_ID=5ffc47f65c4042ce847ef66a3fa70d4c'
    env += '\n#DEBUG=daf:*'

    fs.writeFileSync(envFile, env)
  }
}

const setupAgent = async (): Promise<Daf.Agent> => {
  await writeDefaultEnv()
  config({ path: envFile })
  const configuration = getConfiguration()

  // DID Document Resolver
  let didResolver: Daf.Resolver = new DafResolver({
    networks: configuration.ethrDidNetworks,
  })

  if (process.env.DAF_UNIVERSAL_RESOLVER_URL) {
    didResolver = new DafUniversalResolver({
      url: process.env.DAF_UNIVERSAL_RESOLVER_URL,
    })
  }

  if (process.env.DAF_TG_URI) TrustGraphServiceController.defaultUri = process.env.DAF_TG_URI
  if (process.env.DAF_TG_WSURI) TrustGraphServiceController.defaultWsUri = process.env.DAF_TG_WSURI
  TrustGraphServiceController.webSocketImpl = ws

  const dbConnection = createConnection({
    ...configuration.database,
    entities: [...Daf.Entities],
    migrations: [...Daf.migrations, ...migrations],
  })

  const identityProviders: Daf.AbstractIdentityProvider[] = []

  for (const identityProviderConfig of configuration.identityProviders) {
    switch (identityProviderConfig.package) {
      case 'daf-ethr-did':
        identityProviders.push(
          new EthrDid.IdentityProvider({
            identityStore: new Daf.IdentityStore(
              identityProviderConfig.package + identityProviderConfig.network,
              dbConnection,
            ),
            kms: new KeyManagementSystem(
              new Daf.KeyStore(dbConnection, new SecretBox(process.env.DAF_SECRET_KEY)),
            ),
            network: identityProviderConfig.network,
            rpcUrl: identityProviderConfig.rpcUrl,
            gas: identityProviderConfig.gas,
            ttl: identityProviderConfig.ttl,
            registry: identityProviderConfig.registry,
          }),
        )
        break
      case 'daf-elem-did':
        const ElemDid = require('daf-elem-did')
        identityProviders.push(
          new ElemDid.IdentityProvider({
            identityStore: new Daf.IdentityStore(
              identityProviderConfig.package + identityProviderConfig.network,
              dbConnection,
            ),
            kms: new KeyManagementSystem(
              new Daf.KeyStore(dbConnection, new SecretBox(process.env.DAF_SECRET_KEY)),
            ),
            apiUrl: identityProviderConfig.apiUrl,
            network: identityProviderConfig.network,
          }),
        )
        break
      case 'daf-web-did':
        identityProviders.push(
          new WebDid.IdentityProvider({
            identityStore: new Daf.IdentityStore(identityProviderConfig.package, dbConnection),
            kms: new KeyManagementSystem(
              new Daf.KeyStore(dbConnection, new SecretBox(process.env.DAF_SECRET_KEY)),
            ),
          }),
        )
        break
    }
  }

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
