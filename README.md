[![uport-project](https://circleci.com/gh/uport-project/daf.svg?style=svg)](https://circleci.com/gh/uport-project/daf/tree/master)
[![codecov](https://codecov.io/gh/uport-project/daf/branch/master/graph/badge.svg)](https://codecov.io/gh/uport-project/daf)

# DID Agent Framework

## Notable dependencies

#### Verifiable Credentials

- [did-jwt](https://github.com/decentralized-identity/did-jwt)
- [did-jwt-vc](https://github.com/decentralized-identity/did-jwt-vc#readme)

#### DID Resolution

- [did-resolver](https://github.com/decentralized-identity/did-resolver)
- [ethr-did-resolver](https://github.com/decentralized-identity/ethr-did-resolver)
- [web-did-resolver](https://github.com/decentralized-identity/web-did-resolver)

#### DID Management

- [ethr-did](https://github.com/uport-project/ethr-did)
- [ethjs-provider-signer](https://github.com/ethjs/ethjs-provider-signer)
- [ethjs-signer](https://github.com/ethjs/ethjs-signer)

#### Crypto

- [blakejs](https://github.com/dcposch/blakejs)
- [elliptic](https://github.com/indutny/elliptic)
- [libsodium](https://github.com/jedisct1/libsodium.js)

#### Database access

- [typeorm](https://github.com/typeorm/typeorm)

#### Development

- [typescript](https://www.typescriptlang.org/)
- [OpenAPI](https://www.openapis.org/)
- [GraphQL](https://graphql.org/)

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
