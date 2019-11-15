# DID Agent Framework

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
npx daf credential --create --send
```

Receive new messages

```
npx daf listen
```

More

```
npx daf --help
```

### Advanced

Access your data over GraphQL

```
git clone git@github.com:uport-project/daf.git
cd daf/examples/expressjs
npm i
npm start
```

Open https://CHANGETHIS.ngrok.io/graphql

Copy & paste and run [sample queries](examples/expressjs/README.md#usage)
