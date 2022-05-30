# Veramo data store using JSON trees

Veramo data storage based on JSON trees.
This package provides several plugins that relate to data storage that is backed up by a JSON tree.

### `DataStoreJSON`
A plugin that exposes simple store/get methods for messages, credentials and presentations.
This implements the `@veramo/data-store#DataStore` plugin interface.

### `DataStoreORMJson`
A plugin that provides more querying options using TypeORM.
This implements the `@veramo/data-store#DataStoreORM` plugin interface.

### `KeyStore` and `DIDStore`

Implementations of `AbstractKeyStore` and `AbstractDIDStore`
