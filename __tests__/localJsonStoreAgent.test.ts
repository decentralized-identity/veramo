// noinspection ES6PreferShortImport

/**
 * This runs a suite of ./shared tests using an agent configured for local operations,
 * using a JSON db for storage of credentials and an in-memory store for keys and DIDs.
 *
 */
import { describe, vi } from 'vitest'

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
import { createAgent } from '../packages/core/src/index.js'
import { MessageHandler } from '../packages/message-handler/src/index.js'
import { KeyManager } from '../packages/key-manager/src/index.js'
import { DIDManager } from '../packages/did-manager/src/index.js'
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
import { getDidKeyResolver, KeyDIDProvider } from '../packages/did-provider-key/src/index.js'
import { getDidPkhResolver, PkhDIDProvider } from '../packages/did-provider-pkh/src/index.js'
import { getDidJwkResolver, JwkDIDProvider } from '../packages/did-provider-jwk/src/index.js'
import { DIDComm, DIDCommMessageHandler, IDIDComm } from '../packages/did-comm/src/index.js'
import {
  ISelectiveDisclosure,
  SdrMessageHandler,
  SelectiveDisclosure,
} from '../packages/selective-disclosure/src/index.js'
import { KeyManagementSystem, SecretBox } from '../packages/kms-local/src/index.js'
import { Web3KeyManagementSystem } from '../packages/kms-web3/src/index.js'
import {
  DataStoreJson,
  DIDStoreJson,
  KeyStoreJson,
  PrivateKeyStoreJson,
} from '../packages/data-store-json/src/index.js'
import { FakeDidProvider, FakeDidResolver } from '../packages/test-utils/src/index.js'
import { getResolver as getDidPeerResolver, PeerDIDProvider } from '../packages/did-provider-peer/src/index.js'

import { Resolver } from 'did-resolver'
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
import utils from './shared/utils.js'
import { JsonFileStore } from './utils/json-file-store.js'
import credentialStatus from './shared/credentialStatus.js'
import credentialPluginTests from './shared/credentialPluginTests.js'
import dbInitOptions from './shared/dbInitOptions.js'
import { createGanacheProvider } from '../packages/test-react-app/src/test-utils/ganache-provider.js'

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
    ISelectiveDisclosure
>

let databaseFile: string

const setup = async (options?: IAgentOptions): Promise<boolean> => {
  // This test suite uses a plain JSON file for storage for each agent created.
  // It is important that the same object be used for `DIDStoreJson`/`KeyStoreJson`
  // and `DataStoreJson` if you want to use all the query capabilities of `DataStoreJson`
  databaseFile = options?.context?.databaseFile || `./tmp/local-database-${Math.random().toPrecision(5)}.json`

  const { provider, registry } = await createGanacheProvider()

  // manually create the tmp directory
  await fs.promises.mkdir('./tmp', { recursive: true })

  const jsonFileStore = await JsonFileStore.fromFile(databaseFile)

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
        store: new KeyStoreJson(jsonFileStore),
        kms: {
          local: new KeyManagementSystem(new PrivateKeyStoreJson(jsonFileStore, new SecretBox(secretKey))),
          web3: new Web3KeyManagementSystem({}),
        },
      }),
      new DIDManager({
        store: new DIDStoreJson(jsonFileStore),
        defaultProvider: 'did:ethr',
        providers: {
          'did:ethr': new EthrDIDProvider({
            defaultKms: 'local',
            ttl: 60 * 60 * 24 * 30 * 12 + 1,
            networks: [
              {
                name: 'ganache',
                chainId: 1337,
                provider: provider as any,
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
          ...getDidKeyResolver(),
          ...getDidPeerResolver(),
          ...getDidPkhResolver(),
          ...getDidJwkResolver(),
          ...new FakeDidResolver(() => agent).getDidFakeResolver(),
        }),
      }),
      new DataStoreJson(jsonFileStore),
      new MessageHandler({
        messageHandlers: [
          new DIDCommMessageHandler(),
          new JwtMessageHandler(),
          new W3cMessageHandler(),
          new SdrMessageHandler(),
        ],
      }),
      new DIDComm(),
      new CredentialPlugin([
        new CredentialProviderEIP712(),
        new CredentialProviderJWT(),
        new CredentialProviderLD({
          contextMaps: [LdDefaultContexts, credential_contexts as any],
          suites: [
            new VeramoEcdsaSecp256k1RecoverySignature2020(),
            new VeramoEd25519Signature2018(),
            new VeramoJsonWebSignature2020(),
            new VeramoEd25519Signature2020(),
          ],
        }),
      ]),
      new SelectiveDisclosure(),
      ...(options?.plugins || []),
    ],
  })
  return true
}

const tearDown = async (): Promise<boolean> => {
  try {
    // await (await dbConnection).dropDatabase()
    // await (await dbConnection).close()
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

describe('Local json-data-store integration tests', () => {
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
  credentialPluginTests(testContext)
  dbInitOptions(testContext)
})
