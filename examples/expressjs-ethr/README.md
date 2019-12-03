# DAF expressjs example

## Install

```
yarn
```

## Start

```
yarn start
```

## Usage

Open `https://{CHANGE_THIS}.ngrok.io/graphql` and play around.

Here are some sample queries:

```graphql
query MyDids {
  managedIdentities {
    did
  }
}

mutation CreateNewDid {
  createIdentity(type: "ethr-did-fs") {
    did
  }
}

query AllDataStoreMessages {
  messages {
    iat
    nbf
    iss {
      did
    }
    sub {
      did
    }
    type
    vc {
      fields {
        type
      }
    }
  }
}

query AllDataStoreIdentities {
  identities {
    did
    shortId
  }
}
```
