# Veramo: Mediation Manager Plugin

## setup

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
