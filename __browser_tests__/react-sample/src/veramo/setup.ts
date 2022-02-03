import { createAgent, IResolver } from '@veramo/core'

import { DIDResolverPlugin } from '@veramo/did-resolver'
import { Resolver } from 'did-resolver'
import { getResolver as ethrDidResolver } from 'ethr-did-resolver'
import { getResolver as webDidResolver } from 'web-did-resolver'
import { MessageHandler } from '@veramo/message-handler'
import { KeyManager, MemoryKeyStore, MemoryPrivateKeyStore } from '@veramo/key-manager'
import { DIDManager, MemoryDIDStore } from '@veramo/did-manager'
import { JwtMessageHandler } from '@veramo/did-jwt'
import { W3cMessageHandler } from '@veramo/credential-w3c'
import { DIDCommMessageHandler } from '@veramo/did-comm'
import { SdrMessageHandler } from '@veramo/selective-disclosure'
import { KeyManagementSystem } from '@veramo/kms-local'

const INFURA_PROJECT_ID = '33aab9e0334c44b0a2e0c57c15302608'

export const agent = createAgent<IResolver>({
  plugins: [
    new DIDResolverPlugin({
      resolver: new Resolver({
        ...ethrDidResolver({ infuraProjectId: INFURA_PROJECT_ID }),
        ...webDidResolver(),
      }),
    }),
    new KeyManager({
      store: new MemoryKeyStore(),
      kms: {
        local: new KeyManagementSystem(new MemoryPrivateKeyStore()),
      },
    }),
    new DIDManager({
      store: new MemoryDIDStore(),
      defaultProvider: 'did:ethr:rinkeby',
      providers: {},
    }),
    new MessageHandler({
      messageHandlers: [
        new DIDCommMessageHandler(),
        new JwtMessageHandler(),
        new W3cMessageHandler(),
        new SdrMessageHandler(),
      ],
    }),
  ],
})
