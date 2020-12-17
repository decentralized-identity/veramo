# DAF command line interface

## Install CLI

```
npm -g i daf-cli
```

## Usage

```
Usage:  [options] [command]

Options:
  --config <path>             Configuration file (default: "$HOME/.daf/config.yml")
  -v, --version               output the version number
  -h, --help                  display help for command

Commands:
  identity-manager [options]  Manage identities
  resolve <didUrl>            Resolve DID Document
  credential [options]        Create W3C Verifiable Credential
  presentation [options]      Create W3C Verifiable Presentation
  data-explorer [options]     Explore data store
  graphql [options]           GraphQL server
  sdr [options]               Create Selective Disclosure Request
  msg <raw>                   Handle raw message (JWT)
  crypto [options]            Crypto
  execute [options]           Executes agent method
  server [options]            Launch OpenAPI server
  help [command]              display help for command
```
