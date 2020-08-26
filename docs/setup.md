# Agent setup

## Local

Install DAF core + plugins

```bash
yarn add daf-core@beta daf-resolver@beta daf-did-jwt@beta daf-w3c@beta daf-ethr-did@beta daf-web-did@beta daf-did-comm@beta daf-libsodium@beta daf-selective-disclosure@beta daf-typeorm@beta 
```

Install database dependencies

```bash
yarn add typeorm sqlite3
```

Configure your agent

```typescript
// agent.ts

import {
  createAgent,
  KeyManager,
  IdentityManager,
  TAgent,
  IIdentityManager,
  IResolveDid,
  IKeyManager,
  IDataStore,
  IHandleMessage,
  MessageHandler,
} from 'daf-core'
import { DafResolver } from 'daf-resolver'
import { JwtMessageHandler } from 'daf-did-jwt'
import { W3c, IW3c, W3cMessageHandler } from 'daf-w3c'
import { EthrIdentityProvider } from 'daf-ethr-did'
import { WebIdentityProvider } from 'daf-web-did'
import { DIDComm, DIDCommMessageHandler, IDIDComm } from 'daf-did-comm'
import { Sdr, ISdr, SdrMessageHandler } from 'daf-selective-disclosure'
import { KeyManagementSystem, SecretBox } from 'daf-libsodium'
import { Entities, KeyStore, IdentityStore, IDataStoreORM, DataStore, DataStoreORM } from 'daf-typeorm'
import { createConnection } from 'typeorm'

const infuraProjectId = '5ffc47f65c4042ce847ef66a3fa70d4c'
const secretKey = '29739248cad1bd1a0fc4d9b75cd4d2990de535baf5caadfdf8d8f86664aa830c'
const databaseFile = 'database.sqlite'

const dbConnection = createConnection({
  type: 'sqlite',
  database: databaseFile,
  synchronize: true,
  logging: false,
  entities: Entities,
})

export const agent = createAgent<
  TAgent<
    IIdentityManager &
      IKeyManager &
      IDataStore &
      IDataStoreORM &
      IResolveDid &
      IHandleMessage &
      IDIDComm &
      IW3c &
      ISdr
  >
>({
  plugins: [
    new KeyManager({
      store: new KeyStore(dbConnection, new SecretBox(secretKey)),
      kms: {
        local: new KeyManagementSystem(),
      },
    }),
    new IdentityManager({
      store: new IdentityStore(dbConnection),
      defaultProvider: 'did:ethr:rinkeby',
      providers: {
        'did:ethr:rinkeby': new EthrIdentityProvider({
          defaultKms: 'local',
          network: 'rinkeby',
          rpcUrl: 'https://rinkeby.infura.io/v3/' + infuraProjectId,
        }),
        'did:web': new WebIdentityProvider({
          defaultKms: 'local',
        }),
      },
    }),
    new DafResolver({ infuraProjectId }),
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
    new W3c(),
    new Sdr(),
  ],
})
```

## Remote

