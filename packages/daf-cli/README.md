# DAF command line interface

## Install CLI

```
npm -g i daf-cli
```

## Functionality

- [x] Identity manager
  - [x] List managed identities
  - [x] Create identity
  - [x] Delete identity
  - [x] List available identity controller types
- [x] DID Document resolver
  - [x] Resolve using internal (JS) resolver
  - [x] Resolve using external universal resolver
- [x] Services
  - [x] Sync latest messages (Trust Graph)
  - [x] Subscribe to new messages (Trust Graph)
- [x] Verifiable Credentials
  - [x] Create Verifiable Credential
  - [x] Send Verifiable Credential (DIDComm / TrustGraph)
  - [x] Create Verifiable Presentation
  - [x] Send Verifiable Presentation (DIDComm / TrustGraph)
- [x] Data Store Explorer
  - [x] List known identities
  - [x] List messages
  - [x] List credentials
- [ ] Selective Disclosure Request
  - [x] Create and send SDR
  - [ ] Display received SDR
  - [ ] Create and send VP as a selective disclosure response

## Usage

```
Usage: daf [options] [command]

Options:
  -h, --help                  output usage information

Commands:
  identity-manager [options]  Manage identities
  resolve <did>               Resolve DID Document
  credential [options]        Create W3C Verifiable Credential
  presentation [options]      Create W3C Verifiable Presentation
  listen [options]            Receive new messages and listen for new ones
  data-explorer [options]     Explore data store
  graphql [options]           GraphQL server
  sdr [options]               Create Selective Disclosure Request
  msg <raw>                   Handle raw message (JWT)
```

#### Using custom TGE

Send:

```
DAF_TG_URI=https://custom-tge.eu.ngrok.io/graphql daf credential  -s
```

Receive:

```
DEBUG=* DAF_TG_URI=https://custom-tge.eu.ngrok.io/graphql DAF_TG_WSURI=wss://custom-tge.eu.ngrok.io/graphql daf listen
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

| ENV                          | Default                            | Description                                                                                               |
| ---------------------------- | ---------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `DEBUG`                      | `undefined`                        | Use `*` to see all debug info. [More options](https://github.com/visionmedia/debug#environment-variables) |
| `DAF_IDENTITY_STORE`         | `~/.daf/identity-store.json`       | Identity keyPair storage                                                                                  |
| `DAF_DATA_STORE`             | `~/.daf/data-store.sqlite3`        | Sqlite3 database containing messages, credentials, presentations, etc.                                    |
| `DAF_INFURA_ID`              | `5ffc47f65c4042ce847ef66a3fa70d4c` | Used for calls to the Ethereum blockchain                                                                 |
| `DAF_UNIVERSAL_RESOLVER_URL` | `undefined`                        | Example `https://uniresolver.io/1.0/identifiers/`. If not provided - will use internal resolver           |
| `DAF_TG_URI`                 | `https://edge.uport.me/graphql`    | Trust Graph Endpoint URL                                                                                  |
| `DAF_TG_WSURI`               | `undefined`                        | Trust Graph Endpoint WebSocket URL                                                                        |
