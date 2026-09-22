// noinspection ES6PreferShortImport

/**
 * This runs a suite of ./shared tests using an agent configured for remote operations.
 * There is a local agent that only uses @veramo/remove-client and a remote agent that provides the actual
 * functionality.
 *
 * This suite also runs a messaging server to run through some examples of DIDComm using did:fake identifiers.
 * See didWithFakeDidFlow() for more details.
 */
import { describe, vi } from 'vitest'

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
} from '../packages/core-types/src/index.js'
import { Agent, createAgent } from '../packages/core/src/index.js'
import { MessageHandler } from '../packages/message-handler/src/index.js'
import { KeyManager } from '../packages/key-manager/src/index.js'
import { AliasDiscoveryProvider, DIDManager } from '../packages/did-manager/src/index.js'
import { DIDResolverPlugin } from '../packages/did-resolver/src/index.js'
import { JwtMessageHandler } from '../packages/did-jwt/src/index.js'
import {
  CredentialIssuer,
  ICredentialIssuer,
  ICredentialVerifier,
  W3cMessageHandler,
} from '../packages/credential-w3c/src/index.js'
import { CredentialProviderEIP712 } from '../packages/credential-eip712/src/index.js'
import { CredentialProviderJWT } from '../packages/credential-jwt/src/index.js'
import {
  CredentialProviderLD,
  LdDefaultContexts,
  VeramoEcdsaSecp256k1RecoverySignature2020,
  VeramoEd25519Signature2018,
  VeramoEd25519Signature2020,
  VeramoJsonWebSignature2020,
} from '../packages/credential-ld/src/index.js'
import { EthrDIDProvider } from '../packages/did-provider-ethr/src/index.js'
import { WebDIDProvider } from '../packages/did-provider-web/src/index.js'
import { getDidKeyResolver, KeyDIDProvider } from '../packages/did-provider-key/src/index.js'
import { getDidPkhResolver, PkhDIDProvider } from '../packages/did-provider-pkh/src/index.js'
import { getDidJwkResolver, JwkDIDProvider } from '../packages/did-provider-jwk/src/index.js'
import { getResolver as getDidPeerResolver, PeerDIDProvider } from '../packages/did-provider-peer/src/index.js'
import { DIDComm, DIDCommHttpTransport, DIDCommMessageHandler, IDIDComm } from '../packages/did-comm/src/index.js'
import {
  ISelectiveDisclosure,
  SdrMessageHandler,
  SelectiveDisclosure,
} from '../packages/selective-disclosure/src/index.js'
import { KeyManagementSystem, SecretBox } from '../packages/kms-local/src/index.js'
import { Web3KeyManagementSystem } from '../packages/kms-web3/src/index.js'
import {
  DataStore,
  DataStoreDiscoveryProvider,
  DataStoreORM,
  DIDStore,
  Entities,
  KeyStore,
  migrations,
  PrivateKeyStore,
} from '../packages/data-store/src/index.js'
import { AgentRestClient } from '../packages/remote-client/src/index.js'
import { AgentRouter, MessagingRouter, RequestWithAgentRouter } from '../packages/remote-server/src/index.js'
import { DIDDiscovery, IDIDDiscovery } from '../packages/did-discovery/src/index.js'
import { BrokenDiscoveryProvider, FakeDidProvider, FakeDidResolver } from '../packages/test-utils/src/index.js'

import { DataSource } from 'typeorm'
import { Resolver } from 'did-resolver'
import { getResolver as ethrDidResolver } from 'ethr-did-resolver'
import { getResolver as webDidResolver } from 'web-did-resolver'
// @ts-ignore
import express from 'express'
import { Server } from 'http'
import { contexts as credential_contexts } from '@transmute/credentials-context'
import * as fs from 'fs'


// Shared tests
import verifiableDataJWT from './shared/verifiableDataJWT.js'
import verifiableDataLD from './shared/verifiableDataLD.js'
import verifiableDataEIP712 from './shared/verifiableDataEIP712.js'
import handleSdrMessage from './shared/handleSdrMessage.js'
import resolveDid from './shared/resolveDid.js'
import webDidFlow from './shared/webDidFlow.js'
import documentationExamples from './shared/documentationExamples.js'
import keyManager from './shared/keyManager.js'
import didManager from './shared/didManager.js'
import didCommPacking from './shared/didCommPacking.js'
import didWithFakeDidFlow from './shared/didCommWithFakeDidFlow.js'
import didCommAndDataStoreWithCredentials from './shared/didCommAndDataStoreWithCredentials.js'
import messageHandler from './shared/messageHandler.js'
import didDiscovery from './shared/didDiscovery.js'
import utils from './shared/utils.js'
import credentialStatus from './shared/credentialStatus.js'
import credentialPluginTests from './shared/credentialPluginTests.js'
import { createGanacheProvider } from '../packages/test-react-app/src/test-utils/ganache-provider.js'

vi.setConfig({
  testTimeout: 120_000,
})

const databaseFile = `./tmp/rest-database-${Math.random().toPrecision(5)}.sqlite`
const secretKey = '29739248cad1bd1a0fc4d9b75cd4d2990de535baf5caadfdf8d8f86664aa830c'
const port = 3002
const basePath = '/agent'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let dbConnection: any // typeorm types don't seem to follow semantic release patterns leading to type errors
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

  const { provider, registry } = await createGanacheProvider()

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
                chainId: 1337,
                name: 'ganache',
                provider: provider as any, // different versions of ethers complain about a type mismatch here
                registry,
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
          ...ethrDidResolver({
            networks: [
              {
                chainId: 1337,
                name: 'ganache',
                provider: provider as any, // different versions of ethers complain about a type mismatch here
                registry,
              },
            ],
          }),
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
      new CredentialIssuer([eip712, jwt, ld]),
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
  await new Promise((resolve) => restServer.close(resolve))
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
