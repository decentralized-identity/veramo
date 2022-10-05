// noinspection ES6PreferShortImport

/**
 * This runs a suite of ./shared tests using an agent configured for local operations,
 * using a SQLite db for storage of credentials and an in-memory store for keys and DIDs.
 *
 */
import {
  createAgent,
  IAgentOptions,
  ICredentialPlugin,
  IDataStore,
  IDataStoreORM,
  IDIDManager,
  IKeyManager,
  IMessageHandler,
  IResolver,
  TAgent,
} from '../packages/core/src'
import { MessageHandler } from '../packages/message-handler/src'
import { KeyManager, MemoryKeyStore, MemoryPrivateKeyStore } from '../packages/key-manager/src'
import { DIDManager, MemoryDIDStore } from '../packages/did-manager/src'
import { DataSource } from 'typeorm'
import { DIDResolverPlugin } from '../packages/did-resolver/src'
import { JwtMessageHandler } from '../packages/did-jwt/src'
import { CredentialPlugin, W3cMessageHandler } from '../packages/credential-w3c/src'
import { CredentialIssuerEIP712, ICredentialIssuerEIP712 } from '../packages/credential-eip712/src'
import {
  CredentialIssuerLD,
  ICredentialIssuerLD,
  LdDefaultContexts,
  VeramoEcdsaSecp256k1RecoverySignature2020,
  VeramoEd25519Signature2018,
} from '../packages/credential-ld/src'
import { EthrDIDProvider } from '../packages/did-provider-ethr/src'
import { WebDIDProvider } from '../packages/did-provider-web/src'
import { getDidKeyResolver, KeyDIDProvider } from '../packages/did-provider-key/src'
import { DIDComm, DIDCommLibp2pTransport, DIDCommMessageHandler, IDIDComm } from '../packages/did-comm/src'
import {
  ISelectiveDisclosure,
  SdrMessageHandler,
  SelectiveDisclosure,
} from '../packages/selective-disclosure/src'
import { KeyManagementSystem } from '../packages/kms-local/src'
import { Web3KeyManagementSystem } from '../packages/kms-web3/src'
import { DataStore, DataStoreORM, Entities, migrations } from '../packages/data-store/src'
import { FakeDidProvider, FakeDidResolver } from '../packages/test-utils/src'

import { Resolver } from 'did-resolver'
import { getResolver as ethrDidResolver } from "ethr-did-resolver"
import { getResolver as webDidResolver } from 'web-did-resolver'
import { contexts as credential_contexts } from '@transmute/credentials-context'
import * as fs from 'fs'
// Shared tests
import verifiableDataJWT from './shared/verifiableDataJWT.js'
import verifiableDataLD from './shared/verifiableDataLD.js'
import verifiableDataEIP712 from './shared/verifiableDataEIP712.js'
import handleSdrMessage from './shared/handleSdrMessage.js'
import resolveDid from './shared/resolveDid.js'
import webDidFlow from './shared/webDidFlow.js'
import saveClaims from './shared/saveClaims.js'
import documentationExamples from './shared/documentationExamples.js'
import keyManager from './shared/keyManager.js'
import didManager from './shared/didManager.js'
import didCommPacking from './shared/didCommPacking.js'
import didCommWithLibp2pFakeFlow from './shared/didCommWithLibp2pFakeDidFlow.js'
import messageHandler from './shared/messageHandler.js'
import utils from './shared/utils.js'
import credentialStatus from './shared/credentialStatus.js'
import { jest } from '@jest/globals'
import { Libp2p } from 'libp2p'
import { createLibp2pNode, createLibp2pClientPlugin } from '../packages/libp2p-client/src'
import { Web3Provider } from '@ethersproject/providers'
import { createGanacheProvider } from './utils/ganache-provider.js'
import { createEthersProvider } from './utils/ethers-provider.js'
import { ListenerID } from './utils/libp2p-peerIds.js'
import { IAgentLibp2pClient } from '../packages/libp2p-client/src/types/IAgentLibp2pClient.js'

jest.setTimeout(60000)

const databaseFile = `./tmp/local-database2-${Math.random().toPrecision(5)}.sqlite`
const infuraProjectId = '3586660d179141e3801c3895de1c2eba'

let agent: TAgent<
  IDIDManager &
    IKeyManager &
    IDataStore &
    IDataStoreORM &
    IResolver &
    IMessageHandler &
    IDIDComm &
    IAgentLibp2pClient &
    ICredentialPlugin &
    ICredentialIssuerLD &
    ICredentialIssuerEIP712 &
    ISelectiveDisclosure
>
let dbConnection: DataSource
let libnode: Libp2p

const setup = async (options?: IAgentOptions): Promise<boolean> => {
  // intentionally not initializing here to test compatibility
  dbConnection = new DataSource({
    name: 'test',
    type: 'sqlite',
    database: databaseFile,
    synchronize: false,
    migrations: migrations,
    migrationsRun: true,
    logging: false,
    entities: Entities,
  })

  const peerId = await ListenerID()
  libnode = await createLibp2pNode()

  const libp2pPlugin = await createLibp2pClientPlugin(dbConnection, peerId)

  agent = createAgent<
    IDIDManager &
      IKeyManager &
      IDataStore &
      IDataStoreORM &
      IResolver &
      IMessageHandler &
      IDIDComm &
      IAgentLibp2pClient &
      ICredentialPlugin &
      ICredentialIssuerLD &
      ICredentialIssuerEIP712 &
      ISelectiveDisclosure
  >({
    ...options,
    context: {
      // authorizedDID: 'did:example:3456'
    },
    plugins: [
      new KeyManager({
        store: new MemoryKeyStore(),
        kms: {
          local: new KeyManagementSystem(new MemoryPrivateKeyStore()),
          web3: new Web3KeyManagementSystem({}),
        },
      }),
      new DIDManager({
        store: new MemoryDIDStore(),
        defaultProvider: 'did:ethr:rinkeby',
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
                name: 'rinkeby',
                rpcUrl: 'https://rinkeby.infura.io/v3/' + infuraProjectId,
              },
              {
                chainId: 421611,
                name: 'arbitrum:rinkeby',
                rpcUrl: 'https://arbitrum-rinkeby.infura.io/v3/' + infuraProjectId,
                registry: '0x8f54f62CA28D481c3C30b1914b52ef935C1dF820',
              },
            ],
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
          ...getDidKeyResolver(),
          ...new FakeDidResolver(() => agent).getDidFakeResolver(),
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
      new DIDComm([new DIDCommLibp2pTransport(libnode)]),
      new CredentialPlugin(),
      new CredentialIssuerEIP712(),
      new CredentialIssuerLD({
        contextMaps: [LdDefaultContexts, credential_contexts as any],
        suites: [new VeramoEcdsaSecp256k1RecoverySignature2020(), new VeramoEd25519Signature2018()],
      }),
      new SelectiveDisclosure(),
      libp2pPlugin,
      ...(options?.plugins || []),
    ],
  })
  await libp2pPlugin.setupLibp2p({ agent })
  return true
}

const tearDown = async (): Promise<boolean> => {
  try {
    await (await dbConnection).dropDatabase()
    await (await dbConnection).destroy()
  } catch (e) {
    // nop
  }
  try {
    fs.unlinkSync(databaseFile)
  } catch (e) {
    //nop
  }
  await agent.libp2pShutdown()
  try {
   await libnode.stop()
  } catch (e) {
    //nop
  }
  return true
}

const getAgent = () => agent

const testContext = { getAgent, setup, tearDown }

describe('Local in-memory integration tests', () => {
  verifiableDataJWT(testContext)
  verifiableDataLD(testContext)
  verifiableDataEIP712(testContext)
  handleSdrMessage(testContext)
  resolveDid(testContext)
  webDidFlow(testContext)
  saveClaims(testContext)
  documentationExamples(testContext)
  keyManager(testContext)
  didManager(testContext)
  messageHandler(testContext)
  didCommPacking(testContext)
  utils(testContext)
  credentialStatus(testContext)
  didCommWithLibp2pFakeFlow(testContext)
})
