import { createAgent, IDataStore, IDataStoreORM, IDIDManager, IKeyManager, IResolver, TAgent } from '@veramo/core'

import { DIDResolverPlugin } from '@veramo/did-resolver'
import { Resolver } from 'did-resolver'
import { getResolver as ethrDidResolver } from 'ethr-did-resolver'
import { getResolver as webDidResolver } from 'web-did-resolver'
import { MessageHandler } from '@veramo/message-handler'
import { KeyManager } from '@veramo/key-manager'
import { DIDManager } from '@veramo/did-manager'
import { JwtMessageHandler } from '@veramo/did-jwt'
import { CredentialIssuer, ICredentialIssuer, W3cMessageHandler } from '@veramo/credential-w3c'
// import { getDidKeyResolver, KeyDIDProvider } from '@veramo/did-provider-key'
import { DIDComm, DIDCommMessageHandler, IDIDComm } from '@veramo/did-comm'
import { ISelectiveDisclosure, SdrMessageHandler, SelectiveDisclosure } from '@veramo/selective-disclosure'
import { KeyManagementSystem } from '@veramo/kms-local'
import { EthrDIDProvider } from '@veramo/did-provider-ethr'
import { WebDIDProvider } from '@veramo/did-provider-web'
import { DataStoreJson, DIDStoreJson, KeyStoreJson, PrivateKeyStoreJson } from "@veramo/data-store-json";
// import { FakeDidProvider, FakeDidResolver } from "../../../../__tests__/utils/fake-did";

const INFURA_PROJECT_ID = '33aab9e0334c44b0a2e0c57c15302608'

const memoryJsonStore = {
  notifyUpdate: () => Promise.resolve()
}

type InstalledPlugins =
  IResolver
  & IKeyManager
  & IDIDManager
  & ICredentialIssuer
  & IDataStoreORM
  & IDataStore
  & ISelectiveDisclosure
  & IDIDComm

export const agent: TAgent<InstalledPlugins> = createAgent<InstalledPlugins>({
  plugins: [
    new DIDResolverPlugin({
      resolver: new Resolver({
        ...ethrDidResolver({ infuraProjectId: INFURA_PROJECT_ID }),
        ...webDidResolver(),
        /**
         * `getDidKeyResolver` throws error:
         * "Field 'browser' doesn't contain a valid alias configuration"
         * Can't resolve 'stream'
         * 'stream-browserify' can be installed for brower env
         */
        // ...getDidKeyResolver(),
        // ...new FakeDidResolver(() => agent).getDidFakeResolver(),
      }),
    }),
    new KeyManager({
      store: new KeyStoreJson(memoryJsonStore),
      kms: {
        local: new KeyManagementSystem(new PrivateKeyStoreJson(memoryJsonStore)),
      },
    }),
    new DIDManager({
      store: new DIDStoreJson(memoryJsonStore),
      defaultProvider: 'did:ethr:rinkeby',
      providers: {
        'did:ethr': new EthrDIDProvider({
          defaultKms: 'local',
          network: 'mainnet',
          rpcUrl: 'https://mainnet.infura.io/v3/' + INFURA_PROJECT_ID,
          gas: 1000001,
          ttl: 60 * 60 * 24 * 30 * 12 + 1,
        }),
        'did:ethr:rinkeby': new EthrDIDProvider({
          defaultKms: 'local',
          network: 'rinkeby',
          rpcUrl: 'https://rinkeby.infura.io/v3/' + INFURA_PROJECT_ID,
          gas: 1000001,
          ttl: 60 * 60 * 24 * 30 * 12 + 1,
        }),
        'did:ethr:421611': new EthrDIDProvider({
          defaultKms: 'local',
          network: 421611,
          rpcUrl: 'https://arbitrum-rinkeby.infura.io/v3/' + INFURA_PROJECT_ID,
          registry: '0x8f54f62CA28D481c3C30b1914b52ef935C1dF820',
        }),
        'did:web': new WebDIDProvider({
          defaultKms: 'local',
        }),
        /**
         * `KeyDIDProvider` throws error:
         * "Field 'browser' doesn't contain a valid alias configuration"
         * Can't resolve 'stream'
         * 'stream-browserify' can be installed for browser env
         */
        // 'did:key': new KeyDIDProvider({
        //   defaultKms: 'local',
        // }),
        // 'did:fake': new FakeDidProvider(),
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
    /**
     * `CredentialIssuerLD` throws error:
     *  Can't resolve 'path'
     * 'path-browserify' can be installed for brower env
     */
    // new CredentialIssuerLD({
    //   contextMaps: [LdDefaultContexts],
    //   suites: [new VeramoEcdsaSecp256k1RecoverySignature2020(), new VeramoEd25519Signature2018()],
    // }),
    new SelectiveDisclosure(),
  ],
})
