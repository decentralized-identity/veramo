[TOC]

# Setup

DAF can be used by using Typescript API directly, or by using remote GraphQL api

## Typescript

```typescript=
// We will be using 'did:ethr' identities
import { IdentityProvider } from 'daf-ethr-did'

// Storing key pairs in the database
import { KeyStore } from 'daf-core'
const keyStore = new KeyStore()

// KeyManagementSystem is responsible for managing encryption and signing keys
import { KeyManagementSystem } from 'daf-libsodium'
const kms = new KeyManagementSystem(keyStore)

// Storing managed identities in the database
import { IdentityStore } from 'daf-core'
const identityStore = new IdentityStore('unique-store-name')

// Infura is being used to access Ethereum blockchain. https://infura.io
const infuraProjectId = '5ffc47f65c4042ce847ef66a3fa70d4c'

// Injecting required dependencies, and specifying which blockchain to use and how to access it
const rinkebyIdentityProvider = new IdentityProvider({
  kms,
  identityStore,
  network: 'rinkeby',
  rpcUrl: 'https://rinkeby.infura.io/v3/' + infuraProjectId,
})

// Using local DID Document resolver. It is being used internally to
// validate messages and to get information about service endpoints
import { DafResolver } from 'daf-resolver'
const didResolver = new DafResolver({ infuraProjectId })

// Setting up Message Handler Chain
import { UrlMessageHandler } from 'daf-url'
import { DIDCommMessageHandler } from 'daf-did-comm'
import { JwtMessageHandler } from 'daf-did-jwt'
import { W3cMessageHandler } from 'daf-w3c'
import { SdrMessageHandler } from 'daf-selective-disclosure'
const messageHandler = new UrlMessageHandler()
messageHandler
  .setNext(new DIDCommMessageHandler())
  .setNext(new JwtMessageHandler())
  .setNext(new W3cMessageHandler())
  .setNext(new SdrMessageHandler())

// Setting up Action Handler Chain
import { DIDCommActionHandler } from 'daf-did-comm'
import { W3cActionHandler } from 'daf-w3c'
import { SdrActionHandler } from 'daf-selective-disclosure'
const actionHandler = new W3cActionHandler()
actionHandler
  .setNext(new SdrActionHandler())
  .setNext(new DIDCommActionHandler())

// Initializing the Core 
import { Agent } from 'daf-core'
const agent = new Agent({
  didResolver,
  identityProviders: [rinkebyIdentityProvider],
  actionHandler,
  messageHandler,
})

// Setting up the database connection
import { Entities } from 'daf-core'
import { createConnection } from 'typeorm'
// https://typeorm.io/#/connection-options
await createConnection({
  type: 'sqlite',
  database: 'database.sqlite',
  synchronize: true,
  entities: [...Entities],
})
```

## GraphQL Server
```typescript=
import { ApolloServer } from 'apollo-server'
import { CoreGql, Message, EventTypes } from 'daf-core'
import { W3cGql } from 'daf-w3c'
import { SdrGql } from 'daf-selective-disclosure'
import merge from 'lodash.merge'

const server = new ApolloServer({
  typeDefs: [
    CoreGql.baseTypeDefs,
    CoreGql.typeDefs,
    CoreGql.IdentityManager.typeDefs,
    W3cGql.typeDefs,
    SdrGql.typeDefs,
  ],
  resolvers: merge(
    CoreGql.resolvers,
    CoreGql.IdentityManager.resolvers,
    W3cGql.resolvers,
    SdrGql.resolvers,
  ),
  context: () => ({ agent }),
  introspection: true,
})

agent.on(EventTypes.savedMessage, async (message: Message) => {
  // Add your business logic here
  console.log(message)
})

const info = await server.listen()
console.log(`🚀  Server ready at ${info.url}`)
```

# Create identity

## Typescript

```typescript
const providers = await core.identityManager.getIdentityProviders()
const identity = await core.identityManager.createIdentity(providers[0].type)
```

## GraphQL

```graphql
query {
  identityProviders {
    type
  }
}

mutation createIdentity($type: String!) {
  createIdentity(type: $type) {
    did
  }
}
```

# Selective Disclosure Request

## Sign JWT

``` typescript=
const data = {
  iss: 'did:example:123',
  replyUrl: 'https://example.com/didcomm',
  tag: 'session-123',
  claims: [
    {
      reason: 'We are required by law to collect this information',
      type: 'name',
      essential: true
    },
    {
      reason: 'You can get %30 discount if you are a member of the club',
      type: 'status',
      value: 'member',
      iss: [
        {
          did: 'did:ethr:567',
          url: 'https://join-the-club.partner1.com'        
        },
        {
          did: 'did:ethr:659',
          url: 'https://ecosystem.io'        
        }
      ]
    }
  ],
  vc: ['JWT-public-profile...']
}
```


### Typescript

```typescript
const sdrJwt = await core.handleAction({
  type: 'sign.sdr.jwt',
  data
})
```

### GraphQL


```graphql
mutation signSdrJwt($data: SDRInput!){
  signSdr(data: $data)
}
```

## Show as QR Code
```typescript
const url = encodeURI('https://example.com/ssi?c_i=') + sdrJwt
```
``` html
<img 
  src="https://chart.googleapis.com/chart?chs=540x540&cht=qr&chl={{url}}&choe=UTF-8"
  width="540"
  height="540"
/>
```

## Send DIDComm message

```typescript
const data = {
  from: 'did:example:1234',
  to:   'did:example:3456',
  type: 'jwt', // this is a "subprotocol"
  body: sdrJwt,
}
```

### Typescript

```typescript
const message: Message = await core.handleAction({
  type: 'send.message.didcomm-alpha-1',
  save: true,
  data
})

console.log(message.id) // 443230-234234-123123
console.log(message.type) // sdr
```

### GraphQL

```graphql
mutation sendMessageDidCommAlpha1($data: SendMessageInput!, $save: Boolean = true){
  sendMessageDidCommAlpha1(data: $data, save: $save){
    id
  }
}  
```

# Handle incoming message

```typescript
const raw = 'https://example.com/ssi?c_i=JWT...'
const meta = [ // this is optional
  { type: 'qrcode' },
  { type: 'foo', value: 'bar'}
] 
```

## Typescript

``` typescript
const sdrMessage: Message = await core.handleMessage({ 
  raw, 
  meta,
  save: true, // default = true
})
console.log(message.type) // 'sdr'
console.log(message.credentials) // public profile
```

## GraphQL

```graphql
mutation handleMessage($raw: String!, $meta: [MetaDataInput]) {
  handleMessage(raw: $raw, meta: $meta, save: true){
    id
    type
  }
}
```


# Sign and save Verifiable Credential
```typescript
const data = {
  iss: 'did:example:1234',
  sub: 'did:example:1234',
  vc: {
    '@context': ['https://www.w3.org/2018/credentials/v1'],
    type: ['VerifiableCredential'],
    credentialSubject: {
      name: 'Alice',
    }
  }
}
```

## Typescript

```typescript
const nameVc: Credential = await core.handleAction({
  type: 'sign.w3c.vc.jwt',
  save: true,
  data
})

console.log(nameVc.raw) // JWT....
console.log(nameVc.claims) // [Claim({type: 'name', value: 'Alice', ...})]
```

## GraphQL

```graphql
mutation signCredentialJwt($data: SignCredentialInput!){
  signCredentialJwt(data: $data, save: true) {
    hash
  }
}  
```

# Find Verifiable Credential

## "Manually"

### Typescript

```typescript=
import { In } from 'typeorm'

const nameClaims = await Claim.find({
  where: { 
    subject: 'did:example:1234',
    type: 'name',
  },
  relations: ['credential']
})

const nameVc = nameClaims[0]?.credential


const memberClaims = await Claim.find({
  where: { 
    issuer: In(['did:ethr:567', 'did:ethr:659']),
    subject: 'did:example:1234',
    type: 'status',
    value: 'member',
  },
  relations: ['credential']
})

const memberVc = memberClaims[0]?.credential
```

### GraphQL

```typescript
const input = {
  issuer: ['did:ethr:567', 'did:ethr:659'],
  subject: 'did:example:1234',
  type: 'member',
  value: 'status'
}
```

```graphql
query claims($input: ClaimsInput) {
  claims(input: $input) {
    credential {
      raw
    }  
  }
}
```

## Using the helper

### Typescript

```typescript
const result = await core.handleAction({
  type: 'sdr.find.credentials',
  did: 'did:example:1234',
  message: sdrMessage,
})

console.log(result)
```

```javascript
[
  {
    reason: 'We are required by law to collect this information',
    type: 'name',
    essential: true,
    credentials: [
      Credential(...), // name: 'Alice'
      Credential(...), // name: 'Alisa'
    ]
  },
  {
    reason: 'You can get %30 discount if you are a member of the club',
    type: 'status',
    value: 'member',
    iss: [
      {
        did: 'did:ethr:567',
        url: 'https://join-the-club.partner1.com'        
      },
      {
        did: 'did:ethr:659',
        url: 'https://ecosystem.io'        
      }
    ],
    credentials: [
      Credential(...), // status: 'member', iss: 'did:ethr:567'
      Credential(...), // status: 'member', iss: 'did:ethr:659'
    ]
  }
]
```

### GraphQL

```typescript
const messageId = 'message-id-12345'
const activeDid = 'did:example:1234'
```

```graphql
query message($messageId: ID!, $activeDid: ID!) {
  message(id: $messageId) {
    type
    sdr(did: $activeDid) {
      reason
      type
      value
      essential
      credentials {
        issuer { did }
        claims {
          type
          value
        }
        raw
      }
    }
  }
}
```

# Sign and save Verifiable Presentation

```typescript
const data = {
  iss: 'did:example:1234',
  sub: 'did:example:3456',
  tag: sdrMessage.data.tag,
  vp: {
    '@context': ['https://www.w3.org/2018/credentials/v1'],
    type: ['VerifiablePresentation'],
    verifiableCredential: [nameVc.raw, memberVc.raw],
  }
}
```

## Typescript

```typescript
const vp: Presentation = await core.handleAction({
  type: 'sign.w3c.vp.jwt',
  save: true,
  data
})

console.log(vp.raw) // JWT....
```

## GraphQL

```graphql
mutation signPresentationJwt($data: SignPresentationInput!){
  signPresentationJwt(data: $data, save: true) {
    hash
  }
}  
```

# Reply to Selective Disclosure Request (Send VP)

```typescript
const url = sdrMessage.replyUrl
const data = {
  from: 'did:example:1234',
  to:   'did:example:3456',
  type: 'jwt',
  body: vp.raw,
}
```

## Typescript

```typescript
const message: Message = await core.handleAction({
  type: 'send.message.didcomm-alpha-1',
  save: true,
  url,
  data
})
console.log(message.id) // 443230-234234-123123 
console.log(message.type) // w3c.vp
```

## GraphQL

```graphql
mutation sendMessageDidCommAlpha1($data: SendMessageInput!, $url: String){
  sendMessageDidCommAlpha1(data: $data, url: $url, save: true) {
    id
  }
}  
```

# Checking if VP has all requested VCs

``` typescript
const sdrMessage = await Message.findOne('hash-xzy')
const vpMessage = await Message.findOne('hash-abc', { 
  relations: ['presentations', 'presentations.credentials']
})

const valid: boolean = await core.handleAction({
  type: 'validate.sdr.vp',
  sdr: sdrMessage.data,
  presentations: vpMessage.presentations
})
```

This probably needs more features. This is how Martin was doing it:
https://github.com/uport-project/daf/issues/108

# Querying data

## Entities

* Identity
* Message
* Presentation
* Credential
* Claim

There are too many ways of querying data to fit into this documentation. 
What follows are couple of examples

https://typeorm.io/#/find-options

## Identity

Fields
* did
* provider
* sentMessages
* receivedMessages
* issuedPresentations
* receivedPresentations
* issuedCredentials
* receivedCredentials
* issuedClaims
* receivedClaims

### Typescript

```typescript
import { Identity } from 'daf-core'
const identity = await Identity.findOne('did:example:123', {
  relations: ['receivedClaims']
})

console.log(identity.receivedClaims) // [Claim(type: 'name', value: 'Alice'), ...]
```

### GraphQL

```graphql
query {
  identity(did: "did:example:123") {
    receivedClaims {
      type
      value
    }
  }
}
```

## Message

Fields

* id
* saveDate
* updateDate
* createdAt
* expiresAt
* threadId
* type
* raw
* data
* replyTo
* replyUrl
* from
* to
* metaData
* presentations
* credentials

### Typescript

```typescript
import { Message } from 'daf-core'
const messages = await Message.find({
  take: 5,
  where: {
    type: 'sdr'
  }
})
```

### GraphQL

```graphql
query {
  messages(input: {
    type: "sdr",
    options: {
      take: 5
    }
  }) {
    id
    from { did }
    to { did }
  }
}
```

## Presentation

Fields

* hash
* issuer
* audience
* issuanceDate
* expirationDate
* data
* context
* type
* credentials
* messages

### Typescript

```typescript
import { Presentation } from 'daf-core'
const presentations = await Presentation.find({
  where: {
    issuer: 'did:web:example.com',
    type: 'VerifiablePresentation,KYC'
  },
  relations: ['credentials']
})
```

### GraphQL

```graphql
query {
  presentations(input: {
    type: "VerifiablePresentation,KYC",
    issuer: "did:web:example.com"
  }) {
    audience { did }
    issuanceDate
    expirationDate
    credentials {
      raw
      claims {
        type
        value
      }
    }
  }
}
```

## Credentials

Fields

* hash
* issuer
* subject
* issuanceDate
* expirationDate
* context
* type - e.x. 'VerifiableCredential,KYC'
* data
* claims
* presentations
* messages

### Typescript

```typescript
import { Credential } from 'daf-core'
import { LessThan } from 'typeorm'
const credentials = await Credential.find({
  where: {
    subject: 'did:web:example.com',
    expirationDate: LessThan(new Date())
  },
  relations: ['messages']
})

// This would also return messages where these credentials were used at
```

### GraphQL

```graphql
query {
  credentials(input: {
    subject: "did:web:example.com",
    expirationDateLessThan: "2020-12-12T10:00:00Z"
  }) {
    issuer { did }
    expirationDate
    raw
    messages {
      id
      type
    }
  }
}
```

## Claims

Fields

* hash
* issuer
* subject
* credential
* issuanceDate
* expirationDate
* context
* credentialType - e.x. 'VerifiableCredential,KYC'
* type
* value
* isObj

### Typescript

```typescript
import { Claim } from 'daf-core'
const claims = await Claim.find({
  where: {
    type: 'address',
  },
  relations: ['credential']
})

console.log(claims)
```

```
[
  Claim(
    ...
    type: 'address',
    value: {
      street: 'Some',
      houseNr: 4
    },
    isObj: true
  ),
  Claim(
    ...
    type: 'address',
    value: 'Other str, 5',
    isObj: false
  )
]
```

### GraphQL

```graphql
query {
  claims(input: { type: "address" }) {
    type
    value
    isObj
  }
}
```

## Managed identities

### Typescript

```typescript
const identities = await core.identityManager.getIdentities()
```

### GraphQL

```graphql
query {
  managedIdentities {
    did
    provider
  }
}
```