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

Let's create `setup.ts` file, where we will import all DAF plugins and configure our `Core` instance.

We will be using 'did:ethr' identities

```typescript
import { IdentityProvider } from 'daf-ethr-did'
```

This identity provider requires us to provide [kms](api/daf-core.abstractkeymanagementsystem.md) and [identityStore](api/daf-core.abstractidentitystore.md)

We will be storing serialized key pairs in the file system

```typescript
import { KeyStore } from 'daf-fs'
const keyStore = new KeyStore('./key-store.json')
```

Encryption and signing functionality

```typescript
import { KeyManagementSystem } from 'daf-libsodium'
const kms = new KeyManagementSystem(keyStore)
```

Storing serialized identities in the file system

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
import { MessageValidator as DebugMessageValidator } from 'daf-debug'
import { MessageValidator as JwtMessageValidator } from 'daf-did-jwt'
import { MessageValidator as W3cMessageValidator } from 'daf-w3c'
const messageValidator = new DebugMessageValidator()
messageValidator.setNext(new JwtMessageValidator()).setNext(new W3cMessageValidator())
```

Setting up Action Handler Chain

```typescript
import { ActionHandler as DIDCommActionHandler } from 'daf-did-comm'
import { ActionHandler as TrustGraphActionHandler } from 'daf-trust-graph'
import { ActionHandler as W3cActionHandler } from 'daf-w3c'
import { ActionHandler as DebugActionHandler } from 'daf-debug'
const actionHandler = new DebugActionHandler()
actionHandler
  .setNext(new W3cActionHandler())
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

Let's create `index.ts` file, where we will import configured `Core` and add our business logic

We will use `core.identityManager` to use existing identity, or create a new one

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

To sign a verifiable credential we need to call `core.handleAction` with `action.sign.w3c.vc`.

Let's add this to our `main()` function:

```typescript
// Sign credential
const credential = await core.handleAction({
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

To sign a credential or any other message in JWT format we need to call `core.handleAction` with `action.sendJwt`.

Let's add this to our `main()` function:

```typescript
await core.handleAction({
  type: 'action.sendJwt',
  data: {
    from: identity.did,
    to: 'did:web:uport.me',
    jwt: credential,
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
