# Veramo: Mediation Manager Plugin

A plugin for the Veramo agent for integration with the DIDComm plugin when implementing mediation to the [Cooordinate Mediation V3 Specification](https://didcomm.org/coordinate-mediation/3.0/).  

## setup

The Mediation Manager Plugin can be used via the `agent.yml` or programatically injected to the DIDComm plugin. 

### example agent.yml configuration

`agent.yml` example configuration for the `mediationManager` plugin below:

```yml
# Database
dbConnection:
  $require: typeorm#DataSource
  $args:
    - type: sqlite
      database:
        $ref: /constants/databaseFile
      synchronize: false
      migrationsRun: true
      migrations:
        $require: '@veramo/data-store?t=function#migrationConcat'
        $args:
          - $require: '@veramo/data-store?t=object#migrations'
          - $require: '@veramo/kv-store?t=object#kvStoreMigrations'
      logging: false
      entities:
        $require: '@veramo/data-store?t=function#entitiesConcat'
        $args:
          - $require: '@veramo/data-store?t=object#Entities'
          - $require: '@veramo/kv-store?t=object#Entities'
```

```yml
# Mediation Manager plugin
mediationManager:
  $require: '@veramo/mediation-manager#MediationManagerPlugin'
  $args:
    - isDefaultMediateGrantAll: true
    - policyStore: 
      $require: '@veramo/kv-store#KeyValueStore'
      $args:
          - namespace: 'mediation_policy'
            store:
              $require: '@veramo/kv-store#KeyValueTypeORMStoreAdapter'
              $args:
              - options:
                dbConnection:
                  $ref: /dbConnection
    - mediationStore:
      $require: '@veramo/kv-store#KeyValueStore'
      $args:
          - namespace: 'mediation'
            store:
              $require: '@veramo/kv-store#KeyValueTypeORMStoreAdapter'
              $args:
              - options:
                dbConnection:
                  $ref: /dbConnection
    - recipientDidStore:
      $require: '@veramo/kv-store#KeyValueStore'
      $args:
          - namespace: 'recipient_did'
            store:
              $require: '@veramo/kv-store#KeyValueTypeORMStoreAdapter'
              $args:
              - options:
                dbConnection:
                  $ref: /dbConnection
```

### example TypeScript invocation

```typescript
import {
  KeyValueStore,
  KeyValueTypeORMStoreAdapter,
  Entities as KVStoreEntities,
  kvStoreMigrations,
} from '@veramo/kv-store'
import { DataSource } from 'typeorm'

const dbConnection = new DataSource({
  name: 'test',
  type: 'sqlite',
  database: ':memory:',
  synchronize: false,
  migrations: dataStoreMigrations.concat(kvStoreMigrations),
  migrationsRun: true,
  logging: false,
  entities: (KVStoreEntities as any).concat(DataStoreEntities),
})

const policyStore = new KeyValueStore<PreMediationRequestPolicy>({
  namespace: 'mediation_policy',
  store: new KeyValueTypeORMStoreAdapter({ dbConnection, namespace: 'mediation_policy' }),
})
const mediationStore = new KeyValueStore<MediationResponse>({
  namespace: 'mediation_response',
  store: new KeyValueTypeORMStoreAdapter({ dbConnection, namespace: 'mediation_response' }),
})

const recipientDidStore = new KeyValueStore<RequesterDid>({
  namespace: 'recipient_did',
  store: new KeyValueTypeORMStoreAdapter({ dbConnection, namespace: 'recipient_did' }),
})

const isDefaultMediateGrantAll = true;
const mediationManager = new MediationManagerPlugin(
  isDefaultMediateGrantAll,
  policyStore,
  mediationStore,
  recipientDidStore
)

const agent = createAgent({
  plugins: [
    // other plugins go here
    mediationManager
  ],
})
```
