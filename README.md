[![uport-project](https://circleci.com/gh/uport-project/daf.svg?style=svg)](https://circleci.com/gh/uport-project/daf/tree/master)
[![codecov](https://codecov.io/gh/uport-project/daf/branch/master/graph/badge.svg)](https://codecov.io/gh/uport-project/daf)

# DID Agent Framework

## Documentation

- [API Reference](docs/api/index.md)
- Agent setup
  - Local
  - Remote
  - Mixed
- Using agent
  - Resolving a DID Document
  - Creating identities
  - Importing identities
  - Deleting identities
  - Adding keys to a DID Document
  - Adding services to a DID Document
  - Creating keys
  - Importing keys
  - Deleting keys
  - Creating Verifiable Credentials
  - Creating Verifiable Presentations
  - Handling a message
  - Sending a message
  - Storing data
  - Querying data
  - Selective disclosure
- Extending agent
  - [Agent plugin](docs/plugin.md)
  - Identity manager
    - Identity store
    - Identity provider
  - Key Manager
    - Key store
    - Key Management System
    - Secret Box
  - Message handler

## Local development

DAF monorepo uses [yarn](https://yarnpkg.com/) [workspaces](https://classic.yarnpkg.com/en/docs/workspaces/) and [lerna](https://lerna.js.org/)

Install root package dependencies

```
yarn install
```

Install all packages dependencies

```
yarn bootstrap
```

Build

```
yarn build
```

Run the tests

```
yarn test
```

```
yarn test:watch
```
