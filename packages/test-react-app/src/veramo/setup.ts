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
import { createGanacheProvider } from '../test-utils/ganache-provider'

const DB_SECRET_KEY = '29739248cad1bd1a0fc4d9b75cd4d2990de535baf5caadfdf8d8f86664aa83'

let memoryJsonStore = {
  notifyUpdate: () => Promise.resolve(),
}

let provider: JsonRpcApiProvider
let registry: string

export async function setup() {
  memoryJsonStore = {
    notifyUpdate: () => Promise.resolve(),
  }
  ;({ provider, registry } = await createGanacheProvider())
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

export function getAgent(options?: IAgentOptions): TAgent<InstalledPlugins> {
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
                provider,
                registry,
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
                provider: provider,
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
      new CredentialPlugin({ issuers: [jwt, ld] }),
      new SelectiveDisclosure(),
      ...(options?.plugins || []),
    ],
  })
  return agent
}
