// noinspection ES6PreferShortImport

/**
 * This runs a suite of ./shared tests using an agent configured for local operations,
 * using a SQLite db for storage of credentials and an in-memory store for keys and DIDs.
 *
 */
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
} from '../packages/core-types/src'
import { createAgent } from '../packages/core/src'
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
  VeramoEd25519Signature2018, VeramoEd25519Signature2020, VeramoJsonWebSignature2020,
} from '../packages/credential-ld/src'
import { EthrDIDProvider } from '../packages/did-provider-ethr/src'
import { WebDIDProvider } from '../packages/did-provider-web/src'
import { getDidKeyResolver, KeyDIDProvider } from '../packages/did-provider-key/src'
import { getDidPkhResolver, PkhDIDProvider } from '../packages/did-provider-pkh/src'
import { getDidJwkResolver, JwkDIDProvider } from '../packages/did-provider-jwk/src'
import { DIDComm, DIDCommMessageHandler, IDIDComm } from '../packages/did-comm/src'
import {
  ISelectiveDisclosure,
  SdrMessageHandler,
  SelectiveDisclosure,
} from '../packages/selective-disclosure/src'
import { KeyManagementSystem } from '../packages/kms-local/src'
import { Web3KeyManagementSystem } from '../packages/kms-web3/src'
import { DataStore, DataStoreORM, Entities, migrations } from '../packages/data-store/src'
import { FakeDidProvider, FakeDidResolver } from '../packages/test-utils/src'

import { getResolver as ethrDidResolver } from 'ethr-did-resolver'
import { getResolver as webDidResolver } from 'web-did-resolver'
import { contexts as credential_contexts } from '@transmute/credentials-context'
import * as fs from 'fs'
import { jest } from '@jest/globals'

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
import utils from './shared/utils.js'
import credentialStatus from './shared/credentialStatus.js'
import credentialInterop from './shared/credentialInterop.js'

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
    ICredentialPlugin &
    ICredentialIssuerLD &
    ICredentialIssuerEIP712 &
    ISelectiveDisclosure
>
let dbConnection: DataSource

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
        defaultProvider: 'did:ethr:goerli',
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
                name: 'goerli',
                rpcUrl: 'https://goerli.infura.io/v3/' + infuraProjectId,
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
        ...ethrDidResolver({ infuraProjectId }),
        ...webDidResolver(),
        ...getDidKeyResolver(),
        ...getDidPkhResolver(),
        ...getDidJwkResolver(),
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
      new DIDComm(),
      new CredentialPlugin(),
      new CredentialIssuerEIP712(),
      new CredentialIssuerLD({
        contextMaps: [LdDefaultContexts, credential_contexts as any],
        suites: [
          new VeramoEcdsaSecp256k1RecoverySignature2020(),
          new VeramoEd25519Signature2018(),
          new VeramoJsonWebSignature2020(),
          new VeramoEd25519Signature2020(),
        ],
      }),
      new SelectiveDisclosure(),
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
  credentialInterop(testContext)
})
