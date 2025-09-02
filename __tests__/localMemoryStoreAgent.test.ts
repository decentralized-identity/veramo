// noinspection ES6PreferShortImport

/**
 * This runs a suite of ./shared tests using an agent configured for local operations,
 * using a SQLite db for storage of credentials and an in-memory store for keys and DIDs.
 *
 */
import type {
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
import { PeerDIDProvider, getResolver as getDidPeerResolver } from '../packages/did-provider-peer/src'

import { getResolver as ethrDidResolver } from 'ethr-did-resolver'
import { getResolver as webDidResolver } from 'web-did-resolver'
import { contexts as credential_contexts } from '@transmute/credentials-context'
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
import credentialPluginTests from './shared/credentialPluginTests.js'
import { createGanacheProvider } from '../packages/test-react-app/src/test-utils/ganache-provider'

jest.setTimeout(120000)

let agent: TAgent<
  IDIDManager &
    IKeyManager &
    IDataStore &
    IDataStoreORM &
    IResolver &
    IMessageHandler &
    IDIDComm &
    ICredentialPlugin &
    ISelectiveDisclosure
>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let dbConnection: any // typeorm types don't seem to follow semantic release patterns leading to type errors

const setup = async (options?: IAgentOptions): Promise<boolean> => {
  // intentionally not initializing here to test compatibility
  dbConnection = new DataSource({
    name: 'test',
    type: 'sqlite',
    database: ':memory:',
    synchronize: false,
    migrations: migrations,
    migrationsRun: true,
    logging: false,
    entities: Entities,
  })

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

  agent = createAgent<
    IDIDManager &
      IKeyManager &
      IDataStore &
      IDataStoreORM &
      IResolver &
      IMessageHandler &
      IDIDComm &
      ICredentialPlugin &
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
        defaultProvider: 'did:key',
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
              chainId: 1337,
              name: 'ganache',
              provider: provider as any, // different versions of ethers complain about a type mismatch here
              registry,
            },
          ],
        }),
        ...webDidResolver(),
        ...getDidKeyResolver(),
        ...getDidPeerResolver(),
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
      new CredentialPlugin({ issuers: [eip712, jwt, ld] }),
      new SelectiveDisclosure(),
      ...(options?.plugins || []),
    ],
  })
  return true
}

const tearDown = async (): Promise<boolean> => {
  try {
    await dbConnection?.destroy()
  } catch (e) {
    // nop
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
  credentialPluginTests(testContext)
})
