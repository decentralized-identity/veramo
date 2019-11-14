# DAF expressjs example

## Install

```
npm i
```

## Start

```
npm start
```

## Usage

By default it using the same data as `daf-cli`.

Open `https://{CHANGE_THIS}.ngrok.io/graphql` and play around.

Here are some sample queries:

```graphql

query MyDids{
  managedIdentities {
    did
  }
}

mutation CreateNewDid{
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
      fields{
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
