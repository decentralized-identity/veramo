import {
  ICredentialPlugin,
  IDataStore,
  IDataStoreORM,
  IDIDManager,
  IKeyManager,
  IMessageHandler,
  IResolver,
  TAgent,
} from '@veramo/core-types'

import { createAgent, IAgentOptions } from '@veramo/core'

import { DIDResolverPlugin } from '@veramo/did-resolver'
import { Resolver } from 'did-resolver'
import { getResolver as ethrDidResolver } from 'ethr-did-resolver'
import { getResolver as webDidResolver } from 'web-did-resolver'
import { MessageHandler } from '@veramo/message-handler'
import { KeyManager } from '@veramo/key-manager'
import { DIDManager } from '@veramo/did-manager'
import { JwtMessageHandler } from '@veramo/did-jwt'
import { CredentialPlugin, W3cMessageHandler } from '@veramo/credential-w3c'
import {
  CredentialProviderLD,
  LdDefaultContexts,
  VeramoEcdsaSecp256k1RecoverySignature2020,
  VeramoEd25519Signature2018,
  VeramoEd25519Signature2020,
  VeramoJsonWebSignature2020,
} from '@veramo/credential-ld'
import { getDidKeyResolver, KeyDIDProvider } from '@veramo/did-provider-key'
import { getResolver as getDidPeerResolver, PeerDIDProvider } from '@veramo/did-provider-peer'
import { getDidPkhResolver, PkhDIDProvider } from '@veramo/did-provider-pkh'
import { getDidJwkResolver, JwkDIDProvider } from '@veramo/did-provider-jwk'
import { DIDComm, DIDCommMessageHandler, IDIDComm } from '@veramo/did-comm'
import { ISelectiveDisclosure, SdrMessageHandler, SelectiveDisclosure } from '@veramo/selective-disclosure'
import { KeyManagementSystem, SecretBox } from '@veramo/kms-local'
import { Web3KeyManagementSystem } from '@veramo/kms-web3'
import { EthrDIDProvider } from '@veramo/did-provider-ethr'
import { WebDIDProvider } from '@veramo/did-provider-web'
import { DataStoreJson, DIDStoreJson, KeyStoreJson, PrivateKeyStoreJson } from '@veramo/data-store-json'
import { FakeDidProvider, FakeDidResolver } from '@veramo/test-utils'
import { CredentialProviderJWT } from '@veramo/credential-jwt'
import { JsonRpcApiProvider } from 'ethers'
import { createGanacheProvider, GanacheProvider } from '../test-utils/ganache-provider'

const DB_SECRET_KEY = '29739248cad1bd1a0fc4d9b75cd4d2990de535baf5caadfdf8d8f86664aa83'

let memoryJsonStore = {
  notifyUpdate: () => Promise.resolve(),
}

let provider: JsonRpcApiProvider | undefined
let registry: string | undefined

/**
 * The agent created by the most recent {@link setup} call. Returned by
 * {@link getAgent} when called without options, so a suite that ran its own
 * setup always gets the agent wired to ITS provider/registry/store (per-suite
 * isolation) rather than a freshly-built agent bound to whatever module state
 * happens to be current.
 */
let agent: TAgent<InstalledPlugins> | undefined

/**
 * Prepares a fresh world for one test suite: stops the previous ganache
 * provider (if any), deploys a fresh ERC1056 registry, resets the in-memory
 * store and builds the agent for this suite.
 *
 * Note: any argument is intentionally ignored (historical behavior — options
 * only take effect when passed to `getAgent(options)`), so suites like
 * `dbInitOptions` that call `setup(options)` keep their current semantics.
 */
export async function setup() {
  await tearDown()
  memoryJsonStore = {
    notifyUpdate: () => Promise.resolve(),
  }
  ;({ provider, registry } = await createGanacheProvider())
  agent = buildAgent()
  return true
}

/**
 * Minimal per-suite cleanup: stops the ganache provider of the previous
 * suite (no leaked chains/servers) and resets the in-memory store. Deeper
 * teardown remains out of scope (see CONTEXT.md / ticket 03).
 */
export async function tearDown(): Promise<boolean> {
  const previousProvider = provider as GanacheProvider | undefined
  agent = undefined
  provider = undefined
  registry = undefined
  memoryJsonStore = {
    notifyUpdate: () => Promise.resolve(),
  }
  if (previousProvider?.ganache) {
    // Stops the underlying ganache blockchain instance.
    await previousProvider.ganache.disconnect()
  }
  return true
}

type InstalledPlugins = IResolver &
  IKeyManager &
  IDIDManager &
  ICredentialPlugin &
  IDataStoreORM &
  IDataStore &
  IMessageHandler &
  ISelectiveDisclosure &
  IDIDComm

/**
 * Returns the agent created by the most recent `setup()` call, unless options
 * are given — then a fresh agent is built against the current module state
 * (legacy behavior, used e.g. by resolveDid's `getAgent({ schemaValidation: true })`).
 */
export function getAgent(options?: IAgentOptions): TAgent<InstalledPlugins> {
  if (agent && !options) {
    return agent
  }
  return buildAgent(options)
}

function buildAgent(options?: IAgentOptions): TAgent<InstalledPlugins> {
  const jwt = new CredentialProviderJWT()
  const ld = new CredentialProviderLD({
    contextMaps: [LdDefaultContexts],
    suites: [
      new VeramoEcdsaSecp256k1RecoverySignature2020(),
      new VeramoEd25519Signature2018(),
      new VeramoEd25519Signature2020(),
      new VeramoJsonWebSignature2020(),
    ],
  })
  const agent: TAgent<InstalledPlugins> = createAgent<InstalledPlugins>({
    ...options,
    plugins: [
      new DIDResolverPlugin({
        resolver: new Resolver({
          ...ethrDidResolver({
            networks: [
              {
                chainId: 1337,
                name: 'ganache',
                provider: provider!,
                registry: registry!,
              },
            ],
          }),
          ...webDidResolver(),
          ...getDidKeyResolver(),
          ...getDidPeerResolver(),
          ...getDidPkhResolver(),
          ...getDidJwkResolver(),
          ...new FakeDidResolver(() => agent as TAgent<IDIDManager>).getDidFakeResolver(),
        }),
      }),
      new KeyManager({
        store: new KeyStoreJson(memoryJsonStore),
        kms: {
          local: new KeyManagementSystem(
            new PrivateKeyStoreJson(memoryJsonStore, new SecretBox(DB_SECRET_KEY)),
          ),
          web3: new Web3KeyManagementSystem({}),
        },
      }),
      new DIDManager({
        store: new DIDStoreJson(memoryJsonStore),
        defaultProvider: 'did:pkh',
        providers: {
          'did:ethr': new EthrDIDProvider({
            defaultKms: 'local',
            ttl: 60 * 60 * 24 * 30 * 12 + 1,
            networks: [
              {
                chainId: 1337,
                name: 'ganache',
                provider: provider!,
                registry: registry!,
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
      new DataStoreJson(memoryJsonStore),
      new MessageHandler({
        messageHandlers: [
          new DIDCommMessageHandler(),
          new JwtMessageHandler(),
          new W3cMessageHandler(),
          new SdrMessageHandler(),
        ],
      }),
      new DIDComm(),
      new CredentialPlugin([jwt, ld]),
      new SelectiveDisclosure(),
      ...(options?.plugins || []),
    ],
  })
  return agent
}
