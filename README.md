# DID Agent Framework

## Architecture

![architecture](docs/assets/architecture.png)

## Packages

| Package                                     | Module                                                                    | Description                                                                                                                                      |
| ------------------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| [`daf-cli`](packages/daf-cli)               |                                                                           | Command Line Interface                                                                                                                           |
| [`daf-core`](packages/daf-core)             |                                                                           | Provides types, abstract classes. Main entry point for interacting with the framework                                                            |
| [`daf-data-store`](packages/daf-data-store) |                                                                           | Verifiable data store                                                                                                                            |
|                                             | [`data-store`](packages/daf-data-store/src/data-store.ts)                 | TS API for managing verifiable data                                                                                                              |
|                                             | [`graphql`](packages/daf-data-store/src/graphql.ts)                       | GraphQL typedefs and resolvers                                                                                                                   |
| [`daf-debug`](packages/daf-debug)           |                                                                           | Debug                                                                                                                                            |
|                                             | [`action-handler`](packages/daf-debug/src/action-handler.ts)              | Outputs debug info about the action                                                                                                              |
|                                             | [`message-validator`](packages/daf-debug/src/message-validator.ts)        | Outputs Debug info about the message                                                                                                             |
| [`daf-did-comm`](packages/daf-did-comm)     |                                                                           | DIDComm                                                                                                                                          |
|                                             | [`action-handler`](packages/daf-did-comm/src/action-handler.ts)           | Handles `action.sendJwt`. POSTs JWT to `Messaging` serviceEndpoint in recipient's didDoc. Encrypts data if encryption key is published in didDoc |
|                                             | [`message-validator`](packages/daf-did-comm/src/message-validator.ts)     | Decrypts raw message using encryptions keys and calls next validator                                                                             |
| [`daf-did-jwt`](packages/daf-did-jwt)       |                                                                           | DID JWT                                                                                                                                          |
|                                             | [`message-validator`](packages/daf-did-jwt/src/message-validator.ts)      | Validates JWT, transforms message to have jwt payload as `data` field and calls next validator                                                   |
| [`daf-ethr-did`](packages/daf-ethr-did)     |                                                                           | `did:ethr` based identity                                                                                                                        |
|                                             | [`identity-controller`](packages/daf-ethr-did/src/identity-controller.ts) | Uses [ethr-did](https://github.com/uport-project/ethr-did) to update DID Document                                                                |
|                                             | [`identity-provider`](packages/daf-ethr-did/src/identity-provider.ts)     | Manages multiple identities. Requires                                                                                                            |

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
