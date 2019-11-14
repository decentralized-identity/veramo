# DID Agent Framework

## Quick start

Install [daf-cli](packages/daf-cli)

```
npm -g i daf-cli
```

Create identity

```
daf identity-manager --create
```

Create and send Verifiable Credential

```
daf credential --create --send
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