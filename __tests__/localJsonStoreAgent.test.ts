// noinspection ES6PreferShortImport

/**
 * This runs a suite of ./shared tests using an agent configured for local operations,
 * using a JSON db for storage of credentials and an in-memory store for keys and DIDs.
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
import { KeyManager } from '../packages/key-manager/src'
import { DIDManager } from '../packages/did-manager/src'
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
import { KeyManagementSystem, SecretBox } from '../packages/kms-local/src'
import { Web3KeyManagementSystem } from '../packages/kms-web3/src'
import {
  DataStoreJson,
  DIDStoreJson,
  KeyStoreJson,
  PrivateKeyStoreJson,
} from '../packages/data-store-json/src'
import { FakeDidProvider, FakeDidResolver } from '../packages/test-utils/src'
import { getResolver as getDidPeerResolver, PeerDIDProvider } from '../packages/did-provider-peer/src'

import { Resolver } from 'did-resolver'
import { getResolver as ethrDidResolver } from 'ethr-did-resolver'
import { getResolver as webDidResolver } from 'web-did-resolver'
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
import saveClaims from './shared/saveClaims'
import documentationExamples from './shared/documentationExamples'
import keyManager from './shared/keyManager'
import didManager from './shared/didManager'
import didCommPacking from './shared/didCommPacking'
import messageHandler from './shared/messageHandler'
import utils from './shared/utils'
import { JsonFileStore } from './utils/json-file-store'
import credentialStatus from './shared/credentialStatus'
import credentialPluginTests from './shared/credentialPluginTests'
import dbInitOptions from './shared/dbInitOptions'

jest.setTimeout(120000)

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
  ISelectiveDisclosure
>

let databaseFile: string

const setup = async (options?: IAgentOptions): Promise<boolean> => {
  // This test suite uses a plain JSON file for storage for each agent created.
  // It is important that the same object be used for `DIDStoreJson`/`KeyStoreJson`
  // and `DataStoreJson` if you want to use all the query capabilities of `DataStoreJson`
  databaseFile = options?.context?.databaseFile || `./tmp/local-database-${Math.random().toPrecision(5)}.json`

  await fs.promises.open(databaseFile, 'w+')
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
      new CredentialPlugin({
        issuers: [
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
          })
        ]
      }),
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
