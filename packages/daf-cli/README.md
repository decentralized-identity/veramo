# DAF command line interface

## Install

```
npm -g i daf-cli
```

## Usage

```
Usage: daf [options] [command]

Options:
  -h, --help                  output usage information

Commands:
  identity-manager [options]  Manage identities
  resolve <did>               Resolve DID Document
```

### Identity manager

```
daf identity-manager -h

Usage: daf identity-manager [options]

Manage identities

Options:
  -l, --list           List managed identities
  -t, --types          List available identity controller types
  -c, --create <type>  Create identity using <type> identity controller
  -d, --delete <did>   Delete identity
  -h, --help           output usage information
```
### W3C Credentials

```
Usage: daf credential [options]

Manage W3C Verifiable Credentials

Options:
  -c, --create          Create new credential
  -s, --send            Send
  -q, --qrcode          Show qrcode
  -r, --receiver <did>  Credential subject
  -h, --help            output usage information
```

### Services

Listen for new messages

```
daf listen
```

#### Using custom TGE


Send:
```
DAF_TG_URI=https://mouro.eu.ngrok.io/graphql daf credential -c -s
```

Receive:
```
DEBUG=* DAF_TG_URI=https://mouro.eu.ngrok.io/graphql DAF_TG_WSURI=wss://mouro.eu.ngrok.io/graphql daf listen
```

### DID Document resolver

Internal resolver (`did-resolver`)

```
daf resolve did:web:uport.me
```

Universal resolver

```
DAF_UNIVERSAL_RESOLVER_URL=https://uniresolver.io/1.0/identifiers/ daf resolve did:github:gjgd
```

## Configuration
 ENV | Default | Description 
---|---|---
 `DEBUG` | `undefined` | Use `*` to see all debug info. [More options](https://github.com/visionmedia/debug#environment-variables)
 `DAF_IDENTITY_STORE` | `~/.daf/identity-store.json` | Identity keyPair storage
 `DAF_DATA_STORE` | `~/.daf/data-store.sqlite3` | Sqlite3 database containing messages, credentials, presentations, etc.
 `DAF_ENCRYPTION_STORE` | `~/.daf/encryption-store.json` | Encryption keyPair storage. Used for DIDComm
 `DAF_INFURA_ID` | `5ffc47f65c4042ce847ef66a3fa70d4c` | Used for calls to the Ethereum blockchain
 `DAF_UNIVERSAL_RESOLVER_URL` | `undefined` | Example `https://uniresolver.io/1.0/identifiers/`. If not provided - will use internal resolver 
 `DAF_TG_URI` | `https://edge.uport.me/graphql` | Trust Graph Endpoint URL
 `DAF_TG_WSURI` | `undefined` | Trust Graph Endpoint WebSocket URL