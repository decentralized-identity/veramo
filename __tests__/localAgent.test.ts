// noinspection ES6PreferShortImport

/**
 * This runs a suite of ./shared tests using an agent configured for local operations,
 * using a SQLite db for storage of credentials, presentations, messages as well as keys and DIDs.
 *
 * This suite also runs a ganache local blockchain to run through some examples of DIDComm using did:ethr identifiers.
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
import { KeyManager } from '../packages/key-manager/src'
import { AliasDiscoveryProvider, DIDManager } from '../packages/did-manager/src'
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
import { DIDComm, DIDCommHttpTransport, DIDCommMessageHandler, IDIDComm } from '../packages/did-comm/src'
import {
  ISelectiveDisclosure,
  SdrMessageHandler,
  SelectiveDisclosure,
} from '../packages/selective-disclosure/src'
import { KeyManagementSystem, SecretBox } from '../packages/kms-local/src'
import { Web3KeyManagementSystem } from '../packages/kms-web3/src'
import { DIDDiscovery, IDIDDiscovery } from '../packages/did-discovery/src'

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
import { BrokenDiscoveryProvider, FakeDidProvider, FakeDidResolver } from '../packages/test-utils/src'

import { DataSource } from 'typeorm'
import { createGanacheProvider } from './utils/ganache-provider.js'
import { createEthersProvider } from './utils/ethers-provider.js'
import { getResolver as ethrDidResolver } from 'ethr-did-resolver'
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
import messageHandler from './shared/messageHandler.js'
import didDiscovery from './shared/didDiscovery.js'
import dbInitOptions from './shared/dbInitOptions.js'
import didCommWithEthrDidFlow from './shared/didCommWithEthrDidFlow.js'
import utils from './shared/utils.js'
import web3 from './shared/web3.js'
import credentialStatus from './shared/credentialStatus.js'
import { jest } from '@jest/globals'
import { createLibp2p } from 'libp2p'
console.log("createLibp2p: ", createLibp2p)
import { WebSockets } from '@libp2p/websockets'
console.log("WebSockets: ", WebSockets)
import { WebRTCStar } from '@libp2p/webrtc-star'
console.log("WebRTCStar: ", WebRTCStar)
import { Noise } from '@chainsafe/libp2p-noise'
console.log("Noise: ", Noise)
import { Mplex } from '@libp2p/mplex'
console.log("Mplex: ", Mplex)
import { Bootstrap } from '@libp2p/bootstrap'
console.log("Bootstrap: ", Bootstrap)

jest.setTimeout(30000)

const infuraProjectId = '3586660d179141e3801c3895de1c2eba'
const secretKey = '29739248cad1bd1a0fc4d9b75cd4d2990de535baf5caadfdf8d8f86664aa830c'

let agent: TAgent<
  IDIDManager &
    IKeyManager &
    IDataStore &
    IDataStoreORM &
    IResolver &
    IMessageHandler &
    IDIDComm &
    ICredentialPlugin &
    ICredentialIssuerLD &
    ICredentialIssuerEIP712 &
    ISelectiveDisclosure &
    IDIDDiscovery
>
let dbConnection: Promise<DataSource>
let databaseFile: string

const setup = async (options?: IAgentOptions): Promise<boolean> => {
  databaseFile =
    options?.context?.databaseFile || `./tmp/local-database-${Math.random().toPrecision(5)}.sqlite`
  dbConnection = new DataSource({
    name: options?.context?.['dbName'] || 'test',
    type: 'sqlite',
    database: databaseFile,
    synchronize: false,
    migrations: migrations,
    migrationsRun: true,
    logging: false,
    entities: Entities,
    // allow shared tests to override connection options
    ...options?.context?.dbConnectionOptions,
  }).initialize()

  const { provider, registry } = await createGanacheProvider()
  const ethersProvider = createEthersProvider()

  const webRtcStar = new WebRTCStar()
  const libp2p = await createLibp2p({
    addresses: {
      // Add the signaling server address, along with our PeerId to our multiaddrs list
      // libp2p will automatically attempt to dial to the signaling server so that it can
      // receive inbound connections from other peers
      listen: [
        '/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star',
        '/dns4/wrtc-star2.sjc.dwebops.pub/tcp/443/wss/p2p-webrtc-star'
      ]
    },
    transports: [
      new WebSockets(),
      webRtcStar
    ],
    connectionEncryption: [new Noise()],
    streamMuxers: [new Mplex()],
    peerDiscovery: [
      webRtcStar.discovery,
      new Bootstrap({
        list: [
          '/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN',
          '/dnsaddr/bootstrap.libp2p.io/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb',
          '/dnsaddr/bootstrap.libp2p.io/p2p/QmZa1sAxajnQjVM8WjWXoMbmPd7NsWhfKsPkErzpm9wGkp',
          '/dnsaddr/bootstrap.libp2p.io/p2p/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa',
          '/dnsaddr/bootstrap.libp2p.io/p2p/QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt'
        ]
      })
    ]
  })
  console.log("libp2p: ", libp2p)

  agent = createAgent<
    IDIDManager &
      IKeyManager &
      IDataStore &
      IDataStoreORM &
      IResolver &
      IMessageHandler &
      IDIDComm &
      ICredentialPlugin &
      ICredentialIssuerLD &
      ICredentialIssuerEIP712 &
      ISelectiveDisclosure &
      IDIDDiscovery
  >({
    ...options,
    context: {
      // authorizedDID: 'did:example:3456'
    },
    plugins: [
      new KeyManager({
        store: new KeyStore(dbConnection),
        kms: {
          local: new KeyManagementSystem(new PrivateKeyStore(dbConnection, new SecretBox(secretKey))),
          web3: new Web3KeyManagementSystem({
            ethers: ethersProvider,
          }),
        },
      }),
      new DIDManager({
        store: new DIDStore(dbConnection),
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
              {
                chainId: 1337,
                name: 'ganache',
                provider,
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
          'did:fake': new FakeDidProvider(),
        },
      }),
      new DIDResolverPlugin({
        ...ethrDidResolver({
          infuraProjectId,
          networks: [
            {
              name: 'ganache',
              chainId: 1337,
              provider,
              registry,
            },
          ],
        }),
        ...webDidResolver(),
        ...getDidKeyResolver(),
        ...new FakeDidResolver(() => agent).getDidFakeResolver(),
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
      new CredentialPlugin(),
      new CredentialIssuerEIP712(),
      new CredentialIssuerLD({
        contextMaps: [LdDefaultContexts, credential_contexts as any],
        suites: [new VeramoEcdsaSecp256k1RecoverySignature2020(), new VeramoEd25519Signature2018()],
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
  return true
}

const tearDown = async (): Promise<boolean> => {
  try {
    await (await dbConnection).dropDatabase()
    await (await dbConnection).close()
  } catch (e) {
    // nop
  }
  try {
    fs.unlinkSync(databaseFile)
  } catch (e) {
    // nop
  }
  return true
}

const getAgent = () => agent

const testContext = { getAgent, setup, tearDown }

describe('Local integration tests', () => {
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
  didDiscovery(testContext)
  dbInitOptions(testContext)
  utils(testContext)
  web3(testContext)
  didCommWithEthrDidFlow(testContext)
  credentialStatus(testContext)
})
