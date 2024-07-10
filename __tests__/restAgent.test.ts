// noinspection ES6PreferShortImport

/**
 * This runs a suite of ./shared tests using an agent configured for remote operations.
 * There is a local agent that only uses @veramo/remove-client and a remote agent that provides the actual
 * functionality.
 *
 * This suite also runs a messaging server to run through some examples of DIDComm using did:fake identifiers.
 * See didWithFakeDidFlow() for more details.
 */
import {
  IAgent,
  IAgentOptions,
  IDataStore,
  IDataStoreORM,
  IDIDManager,
  IKeyManager,
  IMessageHandler,
  IResolver,
  TAgent,
} from '../packages/core-types/src'
import { Agent, createAgent } from '../packages/core/src'
import { MessageHandler } from '../packages/message-handler/src'
import { KeyManager } from '../packages/key-manager/src'
import { AliasDiscoveryProvider, DIDManager } from '../packages/did-manager/src'
import { DIDResolverPlugin } from '../packages/did-resolver/src'
import { JwtMessageHandler } from '../packages/did-jwt/src'
import {
  CredentialIssuer,
  ICredentialIssuer,
  ICredentialVerifier,
  W3cMessageHandler,
} from '../packages/credential-w3c/src'
import { CredentialProviderEIP712 } from '../packages/credential-eip712/src'
import { CredentialProviderJWT } from '../packages/credential-jwt/src'
import {
  CredentialProviderLD,
  LdDefaultContexts,
  VeramoEcdsaSecp256k1RecoverySignature2020,
  VeramoEd25519Signature2018,
  VeramoEd25519Signature2020,
  VeramoJsonWebSignature2020,
} from '../packages/credential-ld/src'
import { EthrDIDProvider } from '../packages/did-provider-ethr/src'
import { WebDIDProvider } from '../packages/did-provider-web/src'
import { getDidKeyResolver, KeyDIDProvider } from '../packages/did-provider-key/src'
import { getDidPkhResolver, PkhDIDProvider } from '../packages/did-provider-pkh/src'
import { getDidJwkResolver, JwkDIDProvider } from '../packages/did-provider-jwk/src'
import { getResolver as getDidPeerResolver, PeerDIDProvider } from '../packages/did-provider-peer/src'
import { DIDComm, DIDCommHttpTransport, DIDCommMessageHandler, IDIDComm } from '../packages/did-comm/src'
import {
  ISelectiveDisclosure,
  SdrMessageHandler,
  SelectiveDisclosure,
} from '../packages/selective-disclosure/src'
import { KeyManagementSystem, SecretBox } from '../packages/kms-local/src'
import { Web3KeyManagementSystem } from '../packages/kms-web3/src'
import {
  DataStore,
  DataStoreDiscoveryProvider,
  DataStoreORM,
  DIDStore,
  Entities,
  KeyStore,
  migrations,
  PrivateKeyStore,
} from '../packages/data-store/src'
import { AgentRestClient } from '../packages/remote-client/src'
import { AgentRouter, MessagingRouter, RequestWithAgentRouter } from '../packages/remote-server/src'
import { DIDDiscovery, IDIDDiscovery } from '../packages/did-discovery/src'
import { BrokenDiscoveryProvider, FakeDidProvider, FakeDidResolver } from '../packages/test-utils/src'

import { DataSource } from 'typeorm'
import { Resolver } from 'did-resolver'
import { getResolver as ethrDidResolver } from 'ethr-did-resolver'
import { getResolver as webDidResolver } from 'web-did-resolver'
// @ts-ignore
import express from 'express'
import { Server } from 'http'
import { contexts as credential_contexts } from '@transmute/credentials-context'
import * as fs from 'fs'
import { jest } from '@jest/globals'

// Shared tests
import verifiableDataJWT from './shared/verifiableDataJWT'
import verifiableDataLD from './shared/verifiableDataLD'
import verifiableDataEIP712 from './shared/verifiableDataEIP712'
import handleSdrMessage from './shared/handleSdrMessage'
import resolveDid from './shared/resolveDid'
import webDidFlow from './shared/webDidFlow'
import documentationExamples from './shared/documentationExamples'
import keyManager from './shared/keyManager'
import didManager from './shared/didManager'
import didCommPacking from './shared/didCommPacking'
import didWithFakeDidFlow from './shared/didCommWithFakeDidFlow'
import didCommAndDataStoreWithCredentials from './shared/didCommAndDataStoreWithCredentials'
import messageHandler from './shared/messageHandler'
import didDiscovery from './shared/didDiscovery'
import utils from './shared/utils'
import credentialStatus from './shared/credentialStatus'
import credentialPluginTests from './shared/credentialPluginTests'

jest.setTimeout(120000)

const databaseFile = `./tmp/rest-database-${Math.random().toPrecision(5)}.sqlite`
const infuraProjectId = '3586660d179141e3801c3895de1c2eba'
const secretKey = '29739248cad1bd1a0fc4d9b75cd4d2990de535baf5caadfdf8d8f86664aa830c'
const port = 3002
const basePath = '/agent'

let dbConnection: Promise<DataSource>
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
    ICredentialIssuer & // import from old package to check compatibility
    ICredentialVerifier &
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
  dbConnection = new DataSource({
    name: options?.context?.['dbName'] || 'sqlite-test',
    type: 'sqlite',
    database: databaseFile,
    synchronize: false,
    migrations: migrations,
    migrationsRun: true,
    logging: false,
    entities: Entities,
  }).initialize()

  const eip712 = new CredentialProviderEIP712()
  const jwt = new CredentialProviderJWT()
  const ld = new CredentialProviderLD({
    contextMaps: [LdDefaultContexts, credential_contexts as any],
    suites: [
      new VeramoEcdsaSecp256k1RecoverySignature2020(),
      new VeramoEd25519Signature2018(),
      new VeramoJsonWebSignature2020(),
      new VeramoEd25519Signature2020(),
    ],
  })

  serverAgent = new Agent({
    ...options,
    plugins: [
      new KeyManager({
        store: new KeyStore(dbConnection),
        kms: {
          local: new KeyManagementSystem(new PrivateKeyStore(dbConnection, new SecretBox(secretKey))),
          web3: new Web3KeyManagementSystem({}),
        },
      }),
      new DIDManager({
        store: new DIDStore(dbConnection),
        defaultProvider: 'did:jwk',
        providers: {
          'did:ethr': new EthrDIDProvider({
            defaultKms: 'local',
            ttl: 60 * 60 * 24 * 30 * 12 + 1,
            networks: [
              {
                name: 'mainnet',
                rpcUrl: 'https://mainnet.infura.io/v3/' + infuraProjectId,
              },
              {
                name: 'sepolia',
                chainId: 11155111,
                rpcUrl: 'https://sepolia.infura.io/v3/' + infuraProjectId,
              },
              {
                chainId: 421613,
                name: 'arbitrum:goerli',
                rpcUrl: 'https://arbitrum-goerli.infura.io/v3/' + infuraProjectId,
                registry: '0x8FFfcD6a85D29E9C33517aaf60b16FE4548f517E',
              },
            ],
          }),
          'did:web': new WebDIDProvider({
            defaultKms: 'local',
          }),
          'did:key': new KeyDIDProvider({
            defaultKms: 'local',
          }),
          'did:peer': new PeerDIDProvider({
            defaultKms: 'local',
          }),
          'did:pkh': new PkhDIDProvider({
            defaultKms: 'local',
          }),
          'did:jwk': new JwkDIDProvider({
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
          ...getDidPeerResolver(),
          ...getDidPkhResolver(),
          ...getDidJwkResolver(),
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
      new DIDComm({ transports: [new DIDCommHttpTransport()] }),
      // intentionally use the deprecated name to test compatibility
      new CredentialIssuer({ issuers: [eip712, jwt, ld] }),
      new SelectiveDisclosure(),
      new DIDDiscovery({
        providers: [
          new AliasDiscoveryProvider(),
          new DataStoreDiscoveryProvider(),
          new BrokenDiscoveryProvider(),
        ],
      }),
      new SelectiveDisclosure(),
      new DIDDiscovery({
        providers: [
          new AliasDiscoveryProvider(),
          new DataStoreDiscoveryProvider(),
          new BrokenDiscoveryProvider(),
        ],
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
  verifiableDataEIP712(testContext)
  handleSdrMessage(testContext)
  resolveDid(testContext)
  webDidFlow(testContext)
  documentationExamples(testContext)
  keyManager(testContext)
  didManager(testContext)
  messageHandler(testContext)
  didCommPacking(testContext)
  didWithFakeDidFlow(testContext)
  didCommAndDataStoreWithCredentials(testContext)
  didDiscovery(testContext)
  utils(testContext)
  credentialStatus(testContext)
  credentialPluginTests(testContext)
})
