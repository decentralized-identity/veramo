# Veramo Key Value store

A simple typed Key Value store with out of the box support for in memory/maps, sqlite and typeorm implementations for
usage in browser, NodeJS and React-Native.
It includes a tiered local/remote implementation that support all environments.

# Usage in your application or module

## setup

Veramo provides 3 store adapters out of the box. The first is an in memory Map based store, the second is a TypeORM
based store, meaning we support multiple databases. Lastly there is a tiered store, which allows you to use a local and
remote store together.

You should also be able to use store adapters from the [keyv](https://github.com/jaredwray/keyv) project. Be aware that
Veramo uses an internal fork of that project, as we have several constraints not present in the upstream project. As a
result the adapters are not guaranteed to work in your environment.
See [Keyv project relationship](#keyv-project-relationship) for more information.

### Map based in memory store

This is the simplest implementation where a Map is being used to store the Keys and Values

````typescript
import { IKeyValueStore, IKeyValueStoreOptions, KeyValueStore } from '@veramo/key-value-store'

const options: IKeyValueStoreOptions<MyValueType> = {
  namespace: 'example',
  store: new Map<string, MyValueType>()
}
const kvStore: IKeyValueStore<MyValueType> = new KeyValueStore({ options })
````

### TypeORM store

This implementation uses TypeORM using a simple entity to store the namespace prefixed key, an expiration value and the
value itself. It supports multiple database backends.

````typescript
import {
  IKeyValueStore,
  IKeyValueStoreOptions,
  KeyValueStore,
  KeyValueStoreEntity,
  KeyValueTypeORMStoreAdapter
} from '@veramo/key-value-store'
import { DataSource } from 'typeorm'

const dbConnection: DataSource = await new DataSource({
  type: 'sqlite',
  database: ':memory:',
  logging: 'all',
  migrationsRun: true,
  synchronize: false,
  entities: [KeyValueStoreEntity],
}).initialize()

const options: IKeyValueStoreOptions<MyValueType> = {
  namespace: 'example',
  store: new KeyValueTypeORMStoreAdapter({ dbConnection })
}
const kvStore: IKeyValueStore<MyValueType> = new KeyValueStore({ options })
````

### Tiered store

The tiered store expects a local store and a remote store. Obviously it makes most sense to have a memory based local
store and potentially more expensive/slower remote store

````typescript
import {
  kvStoreMigrations,
  IKeyValueStore,
  IKeyValueStoreOptions,
  KeyValueStore,
  KeyValueStoreEntity,
  KeyValueTieredStoreAdapter,
  KeyValueTypeORMStoreAdapter
} from '@veramo/key-value-store'
import { DataSource } from 'typeorm'

dbConnection = await new DataSource({
  type: 'sqlite',
  database: ':memory:',
  logging: 'all',
  migrationsRun: true,
  synchronize: false,
  migrations: [...kvStoreMigrations],
  entities: [KeyValueStoreEntity],
}).initialize()

const local: Map<string, MyValueType> = new Map()
const remote = new KeyValueTypeORMStoreAdapter({ dbConnection })

const options: IKeyValueStoreOptions<MyValueType> = {
  namespace: 'example',
  store: new KeyValueTieredStoreAdapter({ local, remote })
}
const kvStore: IKeyValueStore<MyValueType> = new KeyValueStore({ options })
````

## Usage

After you have setup the Key Value Store as described above in your agent, it will be available in your agent.



# Keyv project relationship

Please note that a large portion of the Veramo Key Value Store code is a port of
the [keyv](https://github.com/jaredwray/keyv) project, adding support for Typescript and ESM so it can be used Veramo

The ported code should support the storage plugins available for the keyv project.
Veramo itself supports NodeJS, Browser and React-Native environment.
Please be aware that these requirements probably aren't true for any keyv storage plugins.

One of the big changes compared to the upstream project is that this port does not have dynamic loading of adapters
based on URIs. We believe that any Veramo Key Value store should use explicitly defined adapters.

The port is part of the Veramo Key Value Store module code itself, as we do not want to make an official maintained port
out of it.

Veramo exposes its own API/interfaces for the Key Value store, meaning we could also support any other implementation in
the future The Veramo kv-store module provides out of the box support for in memory/maps, sqlite and typeorm
implementations,
including a tiered local/remote implementation that support all environments.

We welcome any new storage modules
