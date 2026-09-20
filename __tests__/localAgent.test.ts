import { describe, vi } from 'vitest'

// noinspection ES6PreferShortImport

/**
 * This runs a suite of ./shared tests using an agent configured for local operations,
 * using a SQLite db for storage of credentials, presentations, messages as well as keys and DIDs.
 *
 * This suite also runs a ganache local blockchain to run through some examples of DIDComm using did:ethr identifiers.
 */

import { createAgent } from '../packages/core/src/index.js'
import {
  IAgentOptions,
  ICredentialPlugin,
  IDataStore,
  IDataStoreORM,
  IDIDManager,
  IKeyManager,
  IMessageHandler,
  IResolver,
  TAgent,
} from '../packages/core-types/src/index.js'
import { MessageHandler } from '../packages/message-handler/src/index.js'
import { KeyManager } from '../packages/key-manager/src/index.js'
import { AliasDiscoveryProvider, DIDManager } from '../packages/did-manager/src/index.js'
import { DIDResolverPlugin } from '../packages/did-resolver/src/index.js'
import { JwtMessageHandler } from '../packages/did-jwt/src/index.js'
import { CredentialPlugin, W3cMessageHandler } from '../packages/credential-w3c/src/index.js'
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
import { getResolver as getDidPeerResolver, PeerDIDProvider } from '../packages/did-provider-peer/src/index.js'
import { getDidKeyResolver, KeyDIDProvider } from '../packages/did-provider-key/src/index.js'
import { getDidPkhResolver, PkhDIDProvider } from '../packages/did-provider-pkh/src/index.js'
import { getDidJwkResolver, JwkDIDProvider } from '../packages/did-provider-jwk/src/index.js'
import { DIDComm, DIDCommHttpTransport, DIDCommMessageHandler, IDIDComm } from '../packages/did-comm/src/index.js'
import {
  ISelectiveDisclosure,
  SdrMessageHandler,
  SelectiveDisclosure,
} from '../packages/selective-disclosure/src/index.js'
import { KeyManagementSystem, SecretBox } from '../packages/kms-local/src/index.js'
import { Web3KeyManagementSystem } from '../packages/kms-web3/src/index.js'
import { DIDDiscovery, IDIDDiscovery } from '../packages/did-discovery/src/index.js'

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
import { BrokenDiscoveryProvider, FakeDidProvider, FakeDidResolver } from '../packages/test-utils/src/index.js'

import { DataSource } from 'typeorm'
import { createGanacheProvider } from '../packages/test-react-app/src/test-utils/ganache-provider.js'
import { createEthersProvider } from '../packages/test-react-app/src/test-utils/ethers-provider.js'
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
import ethrDidFlowSigned from './shared/ethrDidFlowSigned.js'
import didCommWithPeerDidFlow from './shared/didCommWithPeerDidFlow.js'
import credentialPluginTests from './shared/credentialPluginTests.js'

vi.setConfig({
  testTimeout: 120_000,
})

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
    ISelectiveDisclosure &
    IDIDDiscovery
>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let dbConnection: any // typeorm types don't seem to follow semantic release patterns leading to type errors
let databaseFile: string

const setup = async (options?: IAgentOptions): Promise<boolean> => {
  databaseFile = options?.context?.databaseFile || ':memory:'
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
  agent = createAgent<
    IDIDManager &
      IKeyManager &
      IDataStore &
      IDataStoreORM &
      IResolver &
      IMessageHandler &
      IDIDComm &
      ICredentialPlugin &
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
            ethers: ethersProvider as any, // different versions of ethers complain about a type mismatch here
          }),
        },
      }),
      new DIDManager({
        store: new DIDStore(dbConnection),
        defaultProvider: 'did:ethr:ganache',
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
        ...ethrDidResolver({
          networks: [
            {
              name: 'ganache',
              chainId: 1337,
              provider: provider as any,
              registry,
            },
          ],
        }),
        ...webDidResolver(),
        ...getDidKeyResolver(),
        ...getDidPkhResolver(),
        ...getDidJwkResolver(),
        ...getDidPeerResolver(),
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
      new DIDComm({ transports: [new DIDCommHttpTransport()] }),
      new CredentialPlugin([eip712, jwt, ld]),
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
  didCommWithPeerDidFlow(testContext)
  credentialStatus(testContext)
  ethrDidFlowSigned(testContext)
  credentialPluginTests(testContext)
})
