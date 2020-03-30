# DAF Quick Start Guide

This guide will show you how to:

1. Configure DAF Core with:
   - Identity provider
   - DID Document resolver
   - Message validator chain
   - Action handler chain
2. Create new identity
3. Sign Verifiable Credential
4. Send Verifiable Credential
5. Handle Validated message

A working example can be found [here](../examples/send-vc)

## 1. Configure DAF Core

Let's create [setup.ts](../examples/send-vc/setup.ts) file, where we will import DAF plugins and configure our `Core` instance.

We will be using `did:ethr` identities

```typescript
import { IdentityProvider } from 'daf-ethr-did'
```

This identity provider requires us to provide [kms](api/daf-core.abstractkeymanagementsystem.md) and [identityStore](api/daf-core.abstractidentitystore.md)

We will be storing [serialized key pairs](api/daf-core.serializedkey.md) in the file system

```typescript
import { KeyStore } from 'daf-fs'
const keyStore = new KeyStore('./key-store.json')
```

KeyManagementSystem is responsible for managing [encryption and signing keys](api/daf-core.abstractkey.md)

```typescript
import { KeyManagementSystem } from 'daf-libsodium'
const kms = new KeyManagementSystem(keyStore)
```

Storing [serialized identities](api/daf-core.serializedidentity.md) in the file system

```typescript
import { IdentityStore } from 'daf-fs'
const identityStore = new IdentityStore('./identity-store.json')
```

Infura is being used to access Ethereum blockchain. https://infura.io

```typescript
const infuraProjectId = '5ffc47f65c4042ce847ef66a3fa70d4c'
```

Injecting required dependencies, and specifying which blockchain to use and how to access it

```typescript
const rinkebyIdentityProvider = new IdentityProvider({
  kms,
  identityStore,
  network: 'rinkeby',
  rpcUrl: 'https://rinkeby.infura.io/v3/' + infuraProjectId,
})
```

Using local DID Document resolver. It is being used internally to
validate messages and to get information about service endpoints

```typescript
import { DafResolver } from 'daf-resolver'
const didResolver = new DafResolver({ infuraProjectId })
```

Setting up Message Validator Chain

```typescript
import { MessageValidator as JwtMessageValidator } from 'daf-did-jwt'
import { MessageValidator as W3cMessageValidator } from 'daf-w3c'
const messageValidator = new JwtMessageValidator()
messageValidator.setNext(new W3cMessageValidator())
```

Setting up Action Handler Chain

```typescript
import { ActionHandler as DIDCommActionHandler } from 'daf-did-comm'
import { ActionHandler as TrustGraphActionHandler } from 'daf-trust-graph'
import { ActionHandler as W3cActionHandler } from 'daf-w3c'
const actionHandler = new W3cActionHandler()
actionHandler
  .setNext(new DIDCommActionHandler())
  .setNext(new TrustGraphActionHandler())
```

Initializing the Core by injecting dependencies

```typescript
import { Core } from 'daf-core'
export const core = new Core({
  didResolver,
  identityProviders: [rinkebyIdentityProvider],
  actionHandler,
  messageValidator,
})
```

## 2. Create new identity

Let's create [index.ts](../examples/send-vc/index.ts) file, where we will import configured `Core` and add our business logic

We will use [identityManager](api/daf-core.identitymanager.md) to use existing identity, or create a new one

```typescript
import { AbstractIdentity, EventTypes, Message } from 'daf-core'
import { ActionSendJWT } from 'daf-did-comm'
import { ActionSignW3cVc } from 'daf-w3c'
import { core } from './setup'

async function main() {
  let identity: AbstractIdentity
  const identities = await core.identityManager.getIdentities()
  if (identities.length > 0) {
    identity = identities[0]
  } else {
    const identityProviders = await core.identityManager.getIdentityProviderTypes()
    identity = await core.identityManager.createIdentity(identityProviders[0].type)
  }
}

main().catch(console.log)
```

## 3. Sign Verifiable Credential

To sign a verifiable credential we need to call [handleAction](api/daf-core.core.handleaction.md) with `action.sign.w3c.vc`.

Let's add this to our `main()` function:

```typescript
const vcJwt = await core.handleAction({
  type: 'action.sign.w3c.vc',
  did: identity.did,
  data: {
    sub: 'did:web:uport.me',
    vc: {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: ['VerifiableCredential'],
      credentialSubject: {
        you: 'Rock',
      },
    },
  },
} as ActionSignW3cVc)
```

## 4. Send Verifiable Credential

To sign a credential or any other message in JWT format we need to call [handleAction](api/daf-core.core.handleaction.md) with `action.sendJwt`.

Let's add this to our `main()` function:

```typescript
await core.handleAction({
  type: 'action.sendJwt',
  data: {
    from: identity.did,
    to: 'did:web:uport.me',
    jwt: vcJwt,
  },
} as ActionSendJWT)
```

## 5. Handle validated message

This is triggered when DAF successfully validates a new message
which can arrive from external services, or by sending it using `action.sendJwt`

```typescript
core.on(EventTypes.validatedMessage, async (message: Message) => {
  console.log('\n\nSuccessfully sent message:', {
    id: message.id,
    type: message.type,
    sender: message.sender,
    receiver: message.receiver,
    timestamp: message.timestamp,
    data: message.data,
    metadata: message.allMeta,
    raw: message.raw,
  })
})
```

## Output

After running your script, you should get something like this:

```
Successfully sent message: {
  id: 'dba6384464fb6f7a129637b34655a99d88d65d2975d36c9fb29ff10830a137181a97404b3d78337f6dfd199aec1a13367181941e2c93b23705d5a89049be3660',
  type: 'w3c.vc',
  sender: 'did:ethr:rinkeby:0xd4d85eb9d77d520ec184131bdbe05b179a124e24',
  receiver: 'did:web:uport.me',
  timestamp: 1583237003,
  data: {
    iat: 1583237003,
    sub: 'did:web:uport.me',
    vc: { '@context': [Array], type: [Array], credentialSubject: [Object] },
    iss: 'did:ethr:rinkeby:0xd4d85eb9d77d520ec184131bdbe05b179a124e24'
  },
  metadata: [
    { type: 'trustGraph', id: 'https://trustgraph.uport.me/graphql' },
    { type: 'JWT', id: 'ES256K-R' }
  ],
  raw: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NkstUiJ9.eyJpYXQiOjE1ODMyMzcwMDMsInN1YiI6ImRpZDp3ZWI6dXBvcnQubWUiLCJ2YyI6eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSJdLCJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIl0sImNyZWRlbnRpYWxTdWJqZWN0Ijp7InlvdSI6IlJvY2sifX0sImlzcyI6ImRpZDpldGhyOnJpbmtlYnk6MHhkNGQ4NWViOWQ3N2Q1MjBlYzE4NDEzMWJkYmUwNWIxNzlhMTI0ZTI0In0.eTUbZJISYaVxm-UMmM3aFjpAUP9YW7uNC7zqRxjk5cOLMkMFU7zOZNog3WMtxxSmgXi2scyRCAuPEZRGyXfYdAA'
}
```

## Debug information

If you export environment var `DEBUG=daf:*`, you will see something like this:

![debug](assets/debug-log.png)
