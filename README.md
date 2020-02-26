# DID Agent Framework

## Architecture

![architecture](docs/assets/architecture.png)

## Packages

| Package                                                                     | Module                                                                                      | Description                                                                                                                                                                                                                                                       |
| --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`daf-cli`](packages/daf-cli)                                               |                                                                                             | Command Line Interface                                                                                                                                                                                                                                            |
| [`daf-core`](packages/daf-core)                                             |                                                                                             | Provides types, abstract classes. Main entry point for interacting with the framework                                                                                                                                                                             |
| [`daf-data-store`](packages/daf-data-store)                                 | [`data-store`](packages/daf-data-store/src/data-store.ts)                                   | TS API for managing verifiable data                                                                                                                                                                                                                               |
|                                                                             | [`graphql`](packages/daf-data-store/src/graphql.ts)                                         | GraphQL typedefs and resolvers                                                                                                                                                                                                                                    |
| [`daf-debug`](packages/daf-debug)                                           | [`action-handler`](packages/daf-debug/src/action-handler.ts)                                | Outputs debug info about the action                                                                                                                                                                                                                               |
|                                                                             | [`message-validator`](packages/daf-debug/src/message-validator.ts)                          | Outputs Debug info about the message                                                                                                                                                                                                                              |
| [`daf-did-comm`](packages/daf-did-comm)                                     | [`action-handler`](packages/daf-did-comm/src/action-handler.ts)                             | Handles `action.sendJwt`. POSTs JWT to `Messaging` serviceEndpoint in recipient's didDoc. Encrypts data if encryption key is published in didDoc                                                                                                                  |
|                                                                             | [`message-validator`](packages/daf-did-comm/src/message-validator.ts)                       | Decrypts raw message using encryptions keys and calls next validator                                                                                                                                                                                              |
| [`daf-did-jwt`](packages/daf-did-jwt)                                       | [`message-validator`](packages/daf-did-jwt/src/message-validator.ts)                        | Validates JWT, transforms message to have jwt payload as `data` field and calls next validator                                                                                                                                                                    |
| [`daf-ethr-did`](packages/daf-ethr-did)                                     | [`identity-controller`](packages/daf-ethr-did/src/identity-controller.ts)                   | Uses [ethr-did](https://github.com/uport-project/ethr-did) to update DID Document                                                                                                                                                                                 |
|                                                                             | [`identity-provider`](packages/daf-ethr-did/src/identity-provider.ts)                       | Manages multiple identities. Uses [`kms`](packages/daf-core/src/identity/abstract-key-management-system.ts), [`identityStore`](packages/daf-core/src/identity/abstract-identity-store.ts) and `rpcUrl` or `web3Provider`                                          |
|                                                                             | [`identity`](packages/daf-ethr-did/src/identity.ts)                                         | Extends [`AbstractIdentity`](packages/daf-core/src/identity/abstract-identity.ts)                                                                                                                                                                                 |
| [`daf-fs`](packages/daf-fs)                                                 | [`identity-store`](packages/daf-fs/src/identity-store.ts)                                   | Stores serialized identity data in a JSON file                                                                                                                                                                                                                    |
|                                                                             | [`key-store`](packages/daf-fs/src/key-store.ts)                                             | Stores serialized keys in a JSON file                                                                                                                                                                                                                             |
| [`daf-libsodium`](packages/daf-libsodium)                                   | [`didcomm`](packages/daf-libsodium/src/didcomm.ts)                                          | Placeholder for message encryption logic                                                                                                                                                                                                                          |
|                                                                             | [`key-management-system`](packages/daf-libsodium/src/key-management-system.ts)              | Creates keys using [libsodium-wrappers](https://github.com/jedisct1/libsodium.js) and [elliptic](https://github.com/indutny/elliptic). Requires [`keyStore`](packages/daf-core/src/identity/abstract-key-store.ts)                                                |
| [`daf-local-storage`](packages/daf-local-storage)                           | [`identity-store`](packages/daf-local-storage/src/identity-store.ts)                        | Stores serialized identity data in browser's `localStorage`                                                                                                                                                                                                       |
|                                                                             | [`key-store`](packages/daf-local-storage/src/key-store.ts)                                  | Stores serialized keys in browser's `localStorage`                                                                                                                                                                                                                |
| [`daf-node-sqlite3`](packages/daf-node-sqlite3)                             | [`NodeSqlite3`](packages/daf-node-sqlite3/src/index.ts)                                     | Nodejs sqlite3 DB Driver for `daf-data-store`                                                                                                                                                                                                                     |
| [`daf-react-native-async-storage`](packages/daf-react-native-async-storage) | [`identity-store`](packages/daf-react-native-async-storage/src/identity-store.ts)           | Stores serialized identity data using [@react-native-community/async-storage](https://github.com/react-native-community/async-storage)                                                                                                                            |
|                                                                             | [`key-store`](packages/daf-react-native-async-storage/src/key-store.ts)                     | Stores serialized keys using [@react-native-community/async-storage](https://github.com/react-native-community/async-storage)                                                                                                                                     |
| [`daf-react-native-libsodium`](packages/daf-react-native-libsodium)         | [`didcomm`](packages/daf-react-native-libsodium/src/didcomm.ts)                             | Placeholder for message encryption logic                                                                                                                                                                                                                          |
|                                                                             | [`key-management-system`](packages/daf-react-native-libsodium/src/key-management-system.ts) | Creates keys using [react-native-sodium ](https://github.com/lyubo/react-native-sodium) and [elliptic](https://github.com/indutny/elliptic). Requires [`keyStore`](packages/daf-core/src/identity/abstract-key-store.ts)                                          |
| [`daf-node-sqlite3`](packages/daf-react-native-sqlite3)                     | [`RnSqlite3`](packages/daf-react-native-sqlite3/src/index.ts)                               | React Native sqlite3 DB Driver for `daf-data-store`. Uses [react-native-sqlite-storage](https://github.com/andpor/react-native-sqlite-storage)                                                                                                                    |
| [`daf-resolver`](packages/daf-resolver)                                     | [`DafResolver`](packages/daf-resolver/src/resolver.ts)                                      | Preconfigured DID Document resolver. Uses [ethr-did-resolver](https://github.com/decentralized-identity/ethr-did-resolver), [nacl-did](https://github.com/uport-project/nacl-did), [web-did-resolver](https://github.com/decentralized-identity/web-did-resolver) |
| [`daf-resolver-universal`](packages/daf-resolver-universal)                 | [`DafUniversalResolver`](packages/daf-resolver-universal/src/resolver.ts)                   | DID Document resolver that uses hosted services such as [uniresolver.io](https://uniresolver.io)                                                                                                                                                                  |
| [`daf-selective-disclosure`](packages/daf-selective-disclosure)             | [`action-handler`](packages/daf-selective-disclosure/src/action-handler.ts)                 | Handles `action.sign.sdr`. Signs Selective Disclosure Request. Returns JWT                                                                                                                                                                                        |
|                                                                             | [`message-validator`](packages/daf-selective-disclosure/src/message-validator.ts)           | Checks is a message is a Selective Disclosure Request                                                                                                                                                                                                             |
| [`daf-trust-graph`](packages/daf-trust-graph)                               | [`action-handler`](packages/daf-trust-graph/src/action-handler.ts)                          | Handles `action.sendJwt`. POSTs GraphQL mutation to `TrustGraph` serviceEndpoint in recipient's didDoc, or to a [default instance](https://trustgraph.uport.me/graphql)                                                                                           |
|                                                                             | [`graphql`](packages/daf-trust-graph/src/graphql.ts)                                        | GraphQL resolver for `actionSendJwt`                                                                                                                                                                                                                              |
|                                                                             | [`service-controller`](packages/daf-trust-graph/src/service-controller.ts)                  | Handles authentication for TrustGraph endpoints. Gets new messages. Listens for new incoming messages                                                                                                                                                             |
| [`daf-url`](packages/daf-url)                                               | [`message-validator`](packages/daf-url/src/message-validator.ts)                            | Searches for standard standard URL (`https://example.com/?c_i=MESSAGE`), transforms message and calls next validator                                                                                                                                              |
| [`daf-w3c`](packages/daf-w3c)                                               | [`action-handler`](packages/daf-w3c/src/action-handler.ts)                                  | Handles `action.sign.w3c.vc` and `action.sign.w3c.vp`. Signs W3C VerifiableCredential or W3C VerifiablePresentation. Returns JWT                                                                                                                                  |
|                                                                             | [`graphql`](packages/daf-w3c/src/graphql.ts)                                                | GraphQL resolver for `actionSignVc` and `actionSignVc`                                                                                                                                                                                                            |
|                                                                             | [`message-validator`](packages/daf-w3c/src/message-validator.ts)                            | Checks is a message is a valid W3C VerifiableCredential or W3C VerifiablePresentation                                                                                                                                                                             |

## Getting started

DAF monorepo uses yarn workspaces & lerna

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

## DAF cli tool

Use the local development version

```
yarn daf <command> <options>
```

Use the released version [daf-cli](packages/daf-cli)

Create identity

```
npx daf identity-manager --create
```

Create and send Verifiable Credential

```
npx daf credential --qrcode --send
```

Receive new messages

```
npx daf listen
```

Start GraphQL server

```
npx daf graphql --port 8899
```

More

```
npx daf --help
```
