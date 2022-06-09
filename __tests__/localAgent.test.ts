/**
 * This runs a suite of ./shared tests using an agent configured for local operations,
 * using a SQLite db for storage of credentials, presentations, messages as well as keys and DIDs.
 *
 * This suite also runs a ganache local blockchain to run through some examples of DIDComm using did:ethr identifiers.
 */

import {
  createAgent,
  IAgentOptions,
  IDataStore,
  IDataStoreORM,
  IDIDManager,
  IKeyManager,
  IMessageHandler,
  IResolver,
  TAgent,
} from '../packages/core/src'
import { MessageHandler } from '../packages/message-handler/src'
import { KeyManager, MemoryKeyStore } from '../packages/key-manager/src'
import { AliasDiscoveryProvider, DIDManager } from '../packages/did-manager/src'
import { DIDResolverPlugin } from '../packages/did-resolver/src'
import { JwtMessageHandler } from '../packages/did-jwt/src'
import { CredentialIssuer, ICredentialIssuer, W3cMessageHandler } from '../packages/credential-w3c/src'
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
  DataStoreORM,
  DIDStore,
  Entities,
  KeyStore,
  migrations,
  PrivateKeyStore,
  DataStoreDiscoveryProvider,
} from '../packages/data-store/src'
import { FakeDidProvider, FakeDidResolver } from '../packages/test-utils/src'

import { Connection, createConnection } from 'typeorm'
import { createGanacheProvider } from './utils/ganache-provider'
import { Resolver } from 'did-resolver'
import { getResolver as ethrDidResolver } from 'ethr-did-resolver'
import { getResolver as webDidResolver } from 'web-did-resolver'
import { contexts as credential_contexts } from '@transmute/credentials-context'
import * as fs from 'fs'
// Shared tests
import verifiableDataJWT from './shared/verifiableDataJWT'
import verifiableDataLD from './shared/verifiableDataLD'
import verifiableDataEIP712 from './shared/verifiableDataEIP712'
import handleSdrMessage from './shared/handleSdrMessage'
import resolveDid from './shared/resolveDid'
import webDidFlow from './shared/webDidFlow'
import saveClaims from './shared/saveClaims'
import documentationExamples from './shared/documentationExamples'
import keyManager from './shared/keyManager'
import didManager from './shared/didManager'
import didCommPacking from './shared/didCommPacking'
import messageHandler from './shared/messageHandler'
import didDiscovery from './shared/didDiscovery'
import dbInitOptions from './shared/dbInitOptions'
import didCommWithEthrDidFlow from './shared/didCommWithEthrDidFlow'
import utils from './shared/utils'


jest.setTimeout(60000)

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
    ICredentialIssuerLD &
    ICredentialIssuerEIP712 &
    ISelectiveDisclosure &
    IDIDDiscovery
>
let dbConnection: Promise<Connection>
let databaseFile: string

const setup = async (options?: IAgentOptions): Promise<boolean> => {
  databaseFile =
    options?.context?.databaseFile || `./tmp/local-database-${Math.random().toPrecision(5)}.sqlite`
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

  const { provider, registry } = await createGanacheProvider()

  agent = createAgent<
    IDIDManager &
      IKeyManager &
      IDataStore &
      IDataStoreORM &
      IResolver &
      IMessageHandler &
      IDIDComm &
      ICredentialIssuer &
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
          web3: new Web3KeyManagementSystem({}, new MemoryKeyStore())
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
          'did:ethr:ganache': new EthrDIDProvider({
            defaultKms: 'local',
            network: 1337,
            web3Provider: provider,
            registry,
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
      new CredentialIssuerEIP712(),
      new CredentialIssuerLD({
        contextMaps: [LdDefaultContexts, credential_contexts as any],
        suites: [new VeramoEcdsaSecp256k1RecoverySignature2020(), new VeramoEd25519Signature2018()],
      }),
      new SelectiveDisclosure(),
      new DIDDiscovery({
        providers: [new AliasDiscoveryProvider(), new DataStoreDiscoveryProvider()],
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
  // verifiableDataJWT(testContext)
  // verifiableDataLD(testContext)
  // verifiableDataEIP712(testContext)
  // handleSdrMessage(testContext)
  // resolveDid(testContext)
  // webDidFlow(testContext)
  // saveClaims(testContext)
  // documentationExamples(testContext)
  // keyManager(testContext)
  // didManager(testContext)
  // messageHandler(testContext)
  // didCommPacking(testContext)
  // didDiscovery(testContext)
  // dbInitOptions(testContext)
  // didCommWithEthrDidFlow(testContext)
  utils(testContext)
})
