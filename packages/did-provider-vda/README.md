# Veramo did:vda provider

This package contains an implementation of `AbstractIdentifierProvider` for the `did:vda` method.
This enables creation and control of `did:vda` identifiers and resolving their respective DID documents.

## Installation

```bash
npm i @veramo/did-provider-vda
```

## Usage

```ts
import { DIDManager } from '@veramo/did-manager'
import { DIDResolverPlugin } from '@veramo/did-resolver'
import { KeyManager } from '@veramo/key-manager'
import { createAgent } from '@veramo/core'

import { DidVdaProvider, getDidVdaResolver } from '@veramo/did-provider-vda'

const veramo = createAgent({
  plugins: [
    new KeyManager(/*...*/),
    new DIDManager({
      store: new DIDStore(/*...*/),
      defaultProvider: 'did:vda',
      providers: {
        // setup a DID provider to be able to create and manage `did:vda` identifiers
        'did:vda': new DidVdaProvider({
          endpoints: [
            `https://node1-apse2.devnet.verida.tech/did/`,
            `https://node2-apse2.devnet.verida.tech/did/`,
            `https://node3-apse2.devnet.verida.tech/did/`,
          ],
        }),
      },
    }),
    new DIDResolverPlugin({
      // setup a DIDResolver to be able to resolve `did:vda` identifiers and get their DID documents.
      vda: getDidVdaResolver(),
    }),
  ],
})
```
