import {
  createAgent,
  IAgentOptions,
  IDataStore,
  IDataStoreORM,
  IDIDManager,
  IKeyManager,
  IMessageHandler,
  IResolver,
  TAgent
} from '@veramo/core'

import { DIDResolverPlugin } from '@veramo/did-resolver'
import { Resolver } from 'did-resolver'
import { getResolver as ethrDidResolver } from "ethr-did-resolver"
import { getResolver as webDidResolver } from 'web-did-resolver'
import { MessageHandler } from '@veramo/message-handler'
import { KeyManager } from '@veramo/key-manager'
import { DIDManager } from '@veramo/did-manager'
import { JwtMessageHandler } from '@veramo/did-jwt'
import { CredentialIssuer, ICredentialIssuer, W3cMessageHandler } from '@veramo/credential-w3c'
import {
  CredentialIssuerLD,
  ICredentialIssuerLD,
  LdDefaultContexts,
  VeramoEcdsaSecp256k1RecoverySignature2020,
  VeramoEd25519Signature2018
} from '@veramo/credential-ld'
import { getDidKeyResolver, KeyDIDProvider } from '@veramo/did-provider-key'
import { DIDComm, DIDCommMessageHandler, IDIDComm } from '@veramo/did-comm'
import { ISelectiveDisclosure, SdrMessageHandler, SelectiveDisclosure } from '@veramo/selective-disclosure'
import { KeyManagementSystem, SecretBox } from '@veramo/kms-local'
import { Web3KeyManagementSystem } from '@veramo/kms-web3'
import { EthrDIDProvider } from '@veramo/did-provider-ethr'
import { WebDIDProvider } from '@veramo/did-provider-web'
import { DataStoreJson, DIDStoreJson, KeyStoreJson, PrivateKeyStoreJson } from "@veramo/data-store-json";
import { FakeDidProvider, FakeDidResolver } from "@veramo/test-utils";

const INFURA_PROJECT_ID = '33aab9e0334c44b0a2e0c57c15302608'
const DB_SECRET_KEY = '29739248cad1bd1a0fc4d9b75cd4d2990de535baf5caadfdf8d8f86664aa83'

const memoryJsonStore = {
  notifyUpdate: () => Promise.resolve()
}

type InstalledPlugins =
  IResolver
  & IKeyManager
  & IDIDManager
  & ICredentialIssuer
  & ICredentialIssuerLD
  & IDataStoreORM
  & IDataStore
  & IMessageHandler
  & ISelectiveDisclosure
  & IDIDComm

export function getAgent(options?: IAgentOptions): TAgent<InstalledPlugins> {

  const agent: TAgent<InstalledPlugins> = createAgent<InstalledPlugins>({
    ...options,
    plugins: [
      new DIDResolverPlugin({
        resolver: new Resolver({
          ...ethrDidResolver({ infuraProjectId: INFURA_PROJECT_ID }),
          ...webDidResolver(),
          ...getDidKeyResolver(),
          ...new FakeDidResolver(() => agent as TAgent<IDIDManager>).getDidFakeResolver(),
        }),
      }),
      new KeyManager({
        store: new KeyStoreJson(memoryJsonStore),
        kms: {
          local: new KeyManagementSystem(new PrivateKeyStoreJson(memoryJsonStore, new SecretBox(DB_SECRET_KEY))),
          web3: new Web3KeyManagementSystem({})
        },
      }),
      new DIDManager({
        store: new DIDStoreJson(memoryJsonStore),
        defaultProvider: 'did:ethr:rinkeby',
        providers: {
          'did:ethr': new EthrDIDProvider({
            defaultKms: 'local',
            ttl: 60 * 60 * 24 * 30 * 12 + 1,
            networks: [
              {
                name: 'mainnet',
                rpcUrl: 'https://mainnet.infura.io/v3/' + INFURA_PROJECT_ID,
              },
              {
                name: 'rinkeby',
                rpcUrl: 'https://rinkeby.infura.io/v3/' + INFURA_PROJECT_ID,
              },
              {
                chainId: 421611,
                name: 'arbitrum:rinkeby',
                rpcUrl: 'https://arbitrum-rinkeby.infura.io/v3/' + INFURA_PROJECT_ID,
                registry: '0x8f54f62CA28D481c3C30b1914b52ef935C1dF820',
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
      new CredentialIssuer(),
      new CredentialIssuerLD({
        contextMaps: [LdDefaultContexts],
        suites: [
          new VeramoEcdsaSecp256k1RecoverySignature2020(),
          new VeramoEd25519Signature2018()
        ],
      }),
      new SelectiveDisclosure(),
      ...(options?.plugins || []),
    ],
  })
  return agent
}
