import {
  createAgent,
  TAgent,
  IDIDManager,
  IResolver,
  IKeyManager,
  IDataStore,
  IMessageHandler,
  IAgentOptions,
} from '../packages/core/src'
import { MessageHandler } from '../packages/message-handler/src'
import { KeyManager } from '../packages/key-manager/src'
import { DIDManager, AliasDiscoveryProvider } from '../packages/did-manager/src'
import { DIDResolverPlugin } from '../packages/did-resolver/src'
import { JwtMessageHandler } from '../packages/did-jwt/src'
import { CredentialIssuer, ICredentialIssuer, W3cMessageHandler } from '../packages/credential-w3c/src'
import { EthrDIDProvider } from '../packages/did-provider-ethr/src'
import { WebDIDProvider } from '../packages/did-provider-web/src'
import { KeyDIDProvider } from '../packages/did-provider-key/src'
import { DIDComm, DIDCommMessageHandler, IDIDComm, DIDCommHttpTransport } from '../packages/did-comm/src'
import {
  SelectiveDisclosure,
  ISelectiveDisclosure,
  SdrMessageHandler,
} from '../packages/selective-disclosure/src'
import { KeyManagementSystem, SecretBox } from '../packages/kms-local/src'
import { IDIDDiscovery, DIDDiscovery } from '../packages/did-discovery/src'
import { getDidKeyResolver } from '../packages/did-provider-key/src'

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

import { FakeDidProvider, FakeDidResolver } from './utils/fake-did'
import { Resolver } from 'did-resolver'
import { getResolver as ethrDidResolver } from 'ethr-did-resolver'
import { getResolver as webDidResolver } from 'web-did-resolver'
import fs from 'fs'

jest.setTimeout(30000)

// Shared tests
import verifiableData from './shared/verifiableData'
import handleSdrMessage from './shared/handleSdrMessage'
import resolveDid from './shared/resolveDid'
import webDidFlow from './shared/webDidFlow'
import saveClaims from './shared/saveClaims'
import documentationExamples from './shared/documentationExamples'
import keyManager from './shared/keyManager'
import didManager from './shared/didManager'
import didComm from './shared/didcomm'
import messageHandler from './shared/messageHandler'
import didDiscovery from './shared/didDiscovery'
import dbInitOptions from './shared/dbInitOptions'

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
    ICredentialIssuer &
    ISelectiveDisclosure &
    IDIDDiscovery
>
let dbConnection: Promise<Connection>
let databaseFile: string

const setup = async (options?: IAgentOptions): Promise<boolean> => {
  databaseFile = options?.context?.databaseFile || 'local-database.sqlite'
  dbConnection = createConnection({
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
  })

  agent = createAgent<
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
    context: {
      // authenticatedDid: 'did:example:3456'
    },
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
      new DIDComm([new DIDCommHttpTransport()]),
      new CredentialIssuer(),
      new SelectiveDisclosure(),
      new DIDDiscovery({
        providers: [new AliasDiscoveryProvider(), new ProfileDiscoveryProvider()],
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
  verifiableData(testContext)
  handleSdrMessage(testContext)
  resolveDid(testContext)
  webDidFlow(testContext)
  saveClaims(testContext)
  documentationExamples(testContext)
  keyManager(testContext)
  didManager(testContext)
  messageHandler(testContext)
  didComm(testContext)
  didDiscovery(testContext)
  dbInitOptions(testContext)
})
