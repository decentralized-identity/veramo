# Veramo command line interface

## Install CLI

```
npm -g i @veramo/cli
```

## Usage

```
Usage: veramo [options] [command]

Options:
  -v, --version      output the version number
  --config <path>    Configuration file (default: "./agent.yml")
  -h, --help         display help for command

Commands:
  did                Decentralized identifiers
  credential         W3C Verifiable Credential
  presentation       W3C Verifiable Presentation
  explore            launch Verifiable Data explorer
  sdr                Selective Disclosure Request
  message            Messages
  execute [options]  Executes agent method
  server [options]   Launch OpenAPI server
  config             Agent configuration
  dev                Plugin developer tools
  help [command]     display help for command
```

## Developing

When developing in this package, take care to call the local veramo CLI package, rather than the globally installed one.

For example, rather than doing this:

```
veramo credential create
```

you will need to do this:

```
yarn build
yarn veramo credential create
```
