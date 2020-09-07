import { DafResolver } from 'daf-resolver'
import { DafUniversalResolver } from 'daf-resolver-universal'
import {
  IDataStore,
  IIdentityManager,
  IMessageHandler,
  IKeyManager,
  IResolver,
  TAgent,
  IAgentPlugin,
  createAgent,
} from 'daf-core'
import { JwtMessageHandler } from 'daf-did-jwt'
import { EthrIdentityProvider } from 'daf-ethr-did'
import { WebIdentityProvider } from 'daf-web-did'
import { KeyManagementSystem, SecretBox } from 'daf-libsodium'
import { ICredentialIssuer, CredentialIssuer, W3cMessageHandler } from 'daf-w3c'
import { SdrMessageHandler, ISelectiveDisclosure, SelectiveDisclosure } from 'daf-selective-disclosure'
import { IDIDComm, DIDComm, DIDCommMessageHandler } from 'daf-did-comm'
import { KeyManager } from 'daf-key-manager'
import { IdentityManager, AbstractIdentityProvider } from 'daf-identity-manager'
import { MessageHandler } from 'daf-message-handler'
import { UrlMessageHandler } from 'daf-url'
import {
  Entities,
  KeyStore,
  IdentityStore,
  DataStore,
  DataStoreORM,
  IDataStoreORM,
  migrations,
} from 'daf-typeorm'
import { createConnection } from 'typeorm'
import { migrations as cliMigrations } from './migrations'
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

const setupAgent = async (): Promise<
  TAgent<
    IIdentityManager &
      IKeyManager &
      IDataStore &
      IDataStoreORM &
      IResolver &
      IMessageHandler &
      IDIDComm &
      ICredentialIssuer &
      ISelectiveDisclosure
  >
> => {
  await writeDefaultEnv()
  config({ path: envFile })
  if (!process.env.DAF_SECRET_KEY) {
    throw Error('Missing DAF_SECRET_KEY env')
  }
  const configuration = getConfiguration()

  // DID Document Resolver
  let didResolver: IAgentPlugin = new DafResolver({
    networks: configuration.ethrDidNetworks,
  })

  if (process.env.DAF_UNIVERSAL_RESOLVER_URL) {
    didResolver = new DafUniversalResolver({
      url: process.env.DAF_UNIVERSAL_RESOLVER_URL,
    })
  }

  const dbConnection = createConnection({
    ...configuration.database,
    entities: [...Entities],
    migrations: [...migrations, ...cliMigrations],
  })
  //FIXME
  // const identityProviders: Record<string, AbstractIdentityProvider> = {}

  // for (const identityProviderConfig of configuration.identityProviders) {
  //   switch (identityProviderConfig.package) {
  //     case 'daf-ethr-did':
  //       identityProviders.push(
  //         new EthrDid.IdentityProvider({
  //           identityStore: new Daf.IdentityStore(
  //             identityProviderConfig.package + identityProviderConfig.network,
  //             dbConnection,
  //           ),
  //           kms: new KeyManagementSystem(
  //             new Daf.KeyStore(dbConnection, new SecretBox(process.env.DAF_SECRET_KEY)),
  //           ),
  //           network: identityProviderConfig.network,
  //           rpcUrl: identityProviderConfig.rpcUrl,
  //           gas: identityProviderConfig.gas,
  //           ttl: identityProviderConfig.ttl,
  //           registry: identityProviderConfig.registry,
  //         }),
  //       )
  //       break
  //     case 'daf-elem-did':
  //       const ElemDid = require('daf-elem-did')
  //       identityProviders.push(
  //         new ElemDid.IdentityProvider({
  //           identityStore: new Daf.IdentityStore(
  //             identityProviderConfig.package + identityProviderConfig.network,
  //             dbConnection,
  //           ),
  //           kms: new KeyManagementSystem(
  //             new Daf.KeyStore(dbConnection, new SecretBox(process.env.DAF_SECRET_KEY)),
  //           ),
  //           apiUrl: identityProviderConfig.apiUrl,
  //           network: identityProviderConfig.network,
  //         }),
  //       )
  //       break
  //     case 'daf-web-did':
  //       identityProviders.push(
  //         new WebDid.IdentityProvider({
  //           identityStore: new Daf.IdentityStore(identityProviderConfig.package, dbConnection),
  //           kms: new KeyManagementSystem(
  //             new Daf.KeyStore(dbConnection, new SecretBox(process.env.DAF_SECRET_KEY)),
  //           ),
  //         }),
  //       )
  //       break
  //   }
  // }

  const agent = createAgent<
    IIdentityManager &
      IKeyManager &
      IDataStore &
      IDataStoreORM &
      IResolver &
      IMessageHandler &
      IDIDComm &
      ICredentialIssuer &
      ISelectiveDisclosure
  >({
    plugins: [
      new KeyManager({
        store: new KeyStore(dbConnection, new SecretBox(process.env.DAF_SECRET_KEY)),
        kms: {
          local: new KeyManagementSystem(),
        },
      }),

      new IdentityManager({
        store: new IdentityStore(dbConnection),
        defaultProvider: 'did:ethr:rinkeby',
        providers: {
          'did:ethr:rinkeby': new EthrIdentityProvider({
            defaultKms: 'local',
            network: 'rinkeby',
            rpcUrl: 'https://rinkeby.infura.io/v3/' + process.env.DAF_INFURA_ID,
          }),
          'did:web': new WebIdentityProvider({
            defaultKms: 'local',
          }),
        },
      }),

      didResolver,
      new DataStore(dbConnection),
      new DataStoreORM(dbConnection),
      new MessageHandler({
        messageHandlers: [
          new UrlMessageHandler(),
          new DIDCommMessageHandler(),
          new JwtMessageHandler(),
          new W3cMessageHandler(),
          new SdrMessageHandler(),
        ],
      }),
      new DIDComm(),
      new CredentialIssuer(),
      new SelectiveDisclosure(),
    ],
  })
  return agent
}

export const agent = setupAgent()
