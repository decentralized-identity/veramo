[![uport-project](https://circleci.com/gh/uport-project/daf.svg?style=svg)](https://circleci.com/gh/uport-project/daf/tree/master)
[![codecov](https://codecov.io/gh/uport-project/daf/branch/master/graph/badge.svg)](https://codecov.io/gh/uport-project/daf)

# DID Agent Framework

## Documentation

- [API Reference](docs/api/index.md)
- [Agent setup](docs/setup.md)
  - [Local](docs/setup.md#local)
  - [Remote](docs/setup.md#remote)
  - [Mixed](docs/setup.md#mixed)
- [Available agent methods](docs/methods.md)
- [Extending agent functionality](docs/extending.md)

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
