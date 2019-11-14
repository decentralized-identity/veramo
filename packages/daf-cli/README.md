# DAF command line interface

## Install

```
npm -g i daf-cli
```

## Configuration
 ENV | Default | Description 
---|---|---
 `DAF_IDENTITY_STORE` | `~/.daf/identity-store.json` | Identity keyPair storage
 `DAF_DATA_STORE` | `~/.daf/data-store.sqlite3` | Sqlite3 database containing messages, credentials, presentations, etc.
 `DAF_ENCRYPTION_STORE` | `~/.daf/encryption-store.json` | Encryption keyPair storage. Used for DIDComm
 `DAF_INFURA_ID` | `5ffc47f65c4042ce847ef66a3fa70d4c` | Used for calls to the Ethereum blockchain
 `DAF_UNIVERSAL_RESOLVER_URL` | `undefined` | Example `https://uniresolver.io/1.0/identifiers/`. If not provided - will use internal resolver 

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


### DID Document resolver

Internal resolver (`did-resolver`)

```
daf resolve did:web:uport.me
```

Universal resolver

```
DAF_UNIVERSAL_RESOLVER_URL=https://uniresolver.io/1.0/identifiers/ daf resolve did:github:gjgd
```