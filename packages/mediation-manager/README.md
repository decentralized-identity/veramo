# Veramo: Mediation Manager Plugin

A plugin for the Veramo agent for integration with the DIDComm plugin when implementing mediation to the [Cooordinate Mediation V3 Specification](https://didcomm.org/coordinate-mediation/3.0/).  

## Overview

The Mediation Manager plugin enables the Coordinate Mediation V3 Specification in the `did-comm` plugin. There are three distinct stores which represent the three phases of mediation setup as well as a global policy of how requests for mediation should be dealt with. 

0. **Mediation Grant Policy**

By default, the `isMediateGrantAll` policy is set to `true` meaning that any requests for mediation will be `GRANTED` unless their `did` is listed in the `preRequestPolicyStore` as `ALLOW`. Conversely, if the `isMediateGrantAll` policy is set to `false`, all requests will be allowed, unless they are listed in the `preRequestPolicyStore` as `ALLOW`.

1. **Pre-Mediation Policy Store**

This store includes RequesterDid's as a key and stores an associated policy of `ALLOW` or `DENY`.

2. **Mediation Response Store**

Any request for mediation results in either a `GRANTED` or `DENIED` outcome. This is recorded in the `MediationResponseStore` with the `key=requester-did` and the value of `GRANTED` or `DENIED`.

3. **Recipient DID Store**

Finally, once a requester has been granted mediation, they need to inform the mediator of any dids in use (including their requester did or in other words the did they used to request mediation) by using the update recipient did message type.

**CLI Mediate**

For the purpose of managing `ALLOW` or `DENY` pre-mediation policies, as well as listing responses to mediation requests, a cli tool for mediation is available. See:

```bash
veramo mediate -h
```

## Configuration

The Mediation Manager Plugin can be used via the `agent.yml` or programatically injected in to the DIDComm plugin. 

## example agent.yml configuration

`agent.yml` example configuration for the `mediationManager` plugin below:

#### Step 1. Update the `dbConnection` in your `agent.yml`

> NOTE! this is required to include the kv-store migrations and entities so that the stores required by the mediationManager (in the next step) are available.

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

#### Step 2. Configure your Mediation Manager Plugin

> NOTE! each store MUST have a unique namespace so as to prevent conflicts. Each stage of the mediation setup has its own accompanying store.  

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

#### Step 3. Include the `mediationManager` above in your agent's plugins

```yml
# Agent

agent:
  $require: '@veramo/core#Agent'
  $args:
    - schemaValidation: false
      plugins:
        - $ref: /keyManager
        - $ref: /didManager
        - $ref: /didResolver
        - $ref: /didDiscovery
        - $ref: /messageHandler
        - $ref: /mediationManager # <<<< include your mediationManager plugin here
        - $require: '@veramo/did-comm#DIDComm'
        - $require: '@veramo/credential-w3c#CredentialPlugin'
        - $ref: /credentialIssuerLD
        - $require: '@veramo/credential-eip712#CredentialIssuerEIP712'
        - $require: '@veramo/selective-disclosure#SelectiveDisclosure'
        - $require: '@veramo/data-store#DataStore'
          $args:
            - $ref: /dbConnection
        - $require: '@veramo/data-store#DataStoreORM'
          $args:
            - $ref: /dbConnection
```

## Example TypeScript Configuration

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
