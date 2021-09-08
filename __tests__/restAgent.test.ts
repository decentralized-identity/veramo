/**
 * This runs a suite of ./shared tests using an agent configured for remote operations.
 * There is a local agent that only uses @veramo/remove-client and a remote agent that provides the actual functionality.
 * 
 * This suite also runs a messaging server to run through some examples of DIDComm using did:fake identifiers.
 * See didWithFakeDidFlow() for more details.
 */
import 'cross-fetch/polyfill'
import {
  Agent,
  IAgent,
  createAgent,
  IDIDManager,
  IResolver,
  IKeyManager,
  IDataStore,
  IMessageHandler,
  IAgentOptions,
  TAgent,
} from '../packages/core/src'
import { MessageHandler } from '../packages/message-handler/src'
import { KeyManager } from '../packages/key-manager/src'
import { DIDManager, AliasDiscoveryProvider } from '../packages/did-manager/src'
import { DIDResolverPlugin } from '../packages/did-resolver/src'
import { JwtMessageHandler } from '../packages/did-jwt/src'
import {
  CredentialIssuer,
  ICredentialIssuer,
  W3cMessageHandler,
  LdCredentialModule,
  LdContextLoader,
  LdDefaultContexts,
  LdSuiteLoader,
  VeramoEcdsaSecp256k1RecoverySignature2020,
} from '../packages/credential-w3c/src'
import { EthrDIDProvider } from '../packages/did-provider-ethr/src'
import { WebDIDProvider } from '../packages/did-provider-web/src'
import { KeyDIDProvider, getDidKeyResolver } from '../packages/did-provider-key/src'
import { DIDComm, DIDCommMessageHandler, IDIDComm, DIDCommHttpTransport } from '../packages/did-comm/src'
import {
  SelectiveDisclosure,
  ISelectiveDisclosure,
  SdrMessageHandler,
} from '../packages/selective-disclosure/src'
import { KeyManagementSystem, SecretBox } from '../packages/kms-local/src'
import {
  Entities,
  KeyStore,
  DIDStore,
  IDataStoreORM,
  DataStore,
  DataStoreORM,
  ProfileDiscoveryProvider,
  PrivateKeyStore,
  migrations,
} from '../packages/data-store/src'
import { createConnection, Connection } from 'typeorm'
import { AgentRestClient } from '../packages/remote-client/src'
import { AgentRouter, RequestWithAgentRouter, MessagingRouter } from '../packages/remote-server/src'
import { IDIDDiscovery, DIDDiscovery } from '../packages/did-discovery/src'
import { FakeDidProvider, FakeDidResolver } from './utils/fake-did'

import { Resolver } from 'did-resolver'
import { getResolver as ethrDidResolver } from 'ethr-did-resolver'
import { getResolver as webDidResolver } from 'web-did-resolver'
import express from 'express'
import { Server } from 'http'
import { contexts as credential_contexts } from '@transmute/credentials-context'
import fs from 'fs'

jest.setTimeout(30000)

// Shared tests
import verifiableDataJWT from './shared/verifiableDataJWT'
import verifiableDataLD from './shared/verifiableDataLD'
import handleSdrMessage from './shared/handleSdrMessage'
import resolveDid from './shared/resolveDid'
import webDidFlow from './shared/webDidFlow'
import documentationExamples from './shared/documentationExamples'
import keyManager from './shared/keyManager'
import didManager from './shared/didManager'
import didCommPacking from './shared/didCommPacking'
import didWithFakeDidFlow from './shared/didCommWithFakeDidFlow'
import messageHandler from './shared/messageHandler'
import didDiscovery from './shared/didDiscovery'

const databaseFile = `./tmp/rest-database-${Math.random().toPrecision(5)}.sqlite`
const infuraProjectId = '3586660d179141e3801c3895de1c2eba'
const secretKey = '29739248cad1bd1a0fc4d9b75cd4d2990de535baf5caadfdf8d8f86664aa830c'
const port = 3002
const basePath = '/agent'

let dbConnection: Promise<Connection>
let serverAgent: IAgent
let restServer: Server

const getAgent = (options?: IAgentOptions) =>
  createAgent<
    IDIDManager &
      IKeyManager &
      IDataStore &
      IDataStoreORM &
      IResolver &
      IMessageHandler &
      IDIDComm &
      ICredentialIssuer &
      ISelectiveDisclosure &
      IDIDDiscovery
  >({
    ...options,
    plugins: [
      new AgentRestClient({
        url: 'http://localhost:' + port + basePath,
        enabledMethods: serverAgent.availableMethods(),
        schema: serverAgent.getSchema(),
      }),
    ],
  })

const setup = async (options?: IAgentOptions): Promise<boolean> => {
  dbConnection = createConnection({
    name: options?.context?.['dbName'] || 'sqlite-test',
    type: 'sqlite',
    database: databaseFile,
    synchronize: false,
    migrations: migrations,
    migrationsRun: true,
    logging: false,
    entities: Entities,
  })

  serverAgent = new Agent({
    ...options,
    plugins: [
      new KeyManager({
        store: new KeyStore(dbConnection),
        kms: {
          local: new KeyManagementSystem(new PrivateKeyStore(dbConnection, new SecretBox(secretKey))),
        },
      }),
      new DIDManager({
        store: new DIDStore(dbConnection),
        defaultProvider: 'did:ethr:rinkeby',
        providers: {
          'did:ethr': new EthrDIDProvider({
            defaultKms: 'local',
            network: 'mainnet',
            rpcUrl: 'https://mainnet.infura.io/v3/' + infuraProjectId,
            gas: 1000001,
            ttl: 60 * 60 * 24 * 30 * 12 + 1,
          }),
          'did:ethr:rinkeby': new EthrDIDProvider({
            defaultKms: 'local',
            network: 'rinkeby',
            rpcUrl: 'https://rinkeby.infura.io/v3/' + infuraProjectId,
            gas: 1000001,
            ttl: 60 * 60 * 24 * 30 * 12 + 1,
          }),
          'did:ethr:421611': new EthrDIDProvider({
            defaultKms: 'local',
            network: 421611,
            rpcUrl: 'https://arbitrum-rinkeby.infura.io/v3/' + infuraProjectId,
            registry: '0x8f54f62CA28D481c3C30b1914b52ef935C1dF820',
          }),
          'did:web': new WebDIDProvider({
            defaultKms: 'local',
          }),
          'did:key': new KeyDIDProvider({
            defaultKms: 'local',
          }),
          'did:fake': new FakeDidProvider(),
        },
      }),
      new DIDResolverPlugin({
        resolver: new Resolver({
          ...ethrDidResolver({ infuraProjectId }),
          ...webDidResolver(),
          // key: getUniversalResolver(), // resolve using remote resolver... when uniresolver becomes more stable,
          ...getDidKeyResolver(),
          ...new FakeDidResolver(() => serverAgent as TAgent<IDIDManager>).getDidFakeResolver(),
        }),
      }),
      new DataStore(dbConnection),
      new DataStoreORM(dbConnection),
      new MessageHandler({
        messageHandlers: [
          new DIDCommMessageHandler(),
          new JwtMessageHandler(),
          new W3cMessageHandler(),
          new SdrMessageHandler(),
        ],
      }),
      new DIDComm([new DIDCommHttpTransport()]),
      new CredentialIssuer({
        ldCredentialModule: new LdCredentialModule({
          ldContextLoader: new LdContextLoader({
            contextsPaths: [LdDefaultContexts, credential_contexts as Map<string, object>],
          }),
          ldSuiteLoader: new LdSuiteLoader({
            veramoLdSignatures: [
              new VeramoEcdsaSecp256k1RecoverySignature2020(),
            ],
          }),
        }),
      }),
      new SelectiveDisclosure(),
      new DIDDiscovery({
        providers: [new AliasDiscoveryProvider(), new ProfileDiscoveryProvider()],
      }),
      ...(options?.plugins || []),
    ],
  })

  const agentRouter = AgentRouter({
    exposedMethods: serverAgent.availableMethods(),
  })

  const requestWithAgent = RequestWithAgentRouter({
    agent: serverAgent,
  })

  return new Promise((resolve) => {
    const app = express()
    app.use(basePath, requestWithAgent, agentRouter)
    app.use(
      '/messaging',
      requestWithAgent,
      MessagingRouter({
        metaData: { type: 'DIDComm', value: 'integration test' },
      }),
    )
    restServer = app.listen(port, () => {
      resolve(true)
    })
  })
}

const tearDown = async (): Promise<boolean> => {
  await new Promise((resolve, reject) => restServer.close(resolve))
  try {
    await (await dbConnection).dropDatabase()
    await (await dbConnection).close()
  } catch (e) {
    // nop
  }
  try {
    fs.unlinkSync(databaseFile)
  } catch (e) {
    //nop
  }
  return true
}

const testContext = { getAgent, setup, tearDown }

describe('REST integration tests', () => {
  verifiableDataJWT(testContext)
  verifiableDataLD(testContext)
  handleSdrMessage(testContext)
  resolveDid(testContext)
  webDidFlow(testContext)
  documentationExamples(testContext)
  keyManager(testContext)
  didManager(testContext)
  messageHandler(testContext)
  didCommPacking(testContext)
  didWithFakeDidFlow(testContext)
  didDiscovery(testContext)
})
