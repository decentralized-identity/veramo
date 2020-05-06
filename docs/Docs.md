# Setup

DAF can be used by using Typescript API directly, or by using remote GraphQL api

## Typescript

```typescript
// Setting up the database connection
import { Entities } from 'daf-core'
import { createConnection } from 'typeorm'
// https://typeorm.io/#/connection-options
const dbConnection = createConnection({
  type: 'sqlite',
  database: 'database.sqlite',
  synchronize: true,
  entities: [...Entities],
})

// We will be using 'did:ethr' identities
import { IdentityProvider } from 'daf-ethr-did'

// Storing key pairs in the database
import { KeyStore } from 'daf-core'
const keyStore = new KeyStore(dbConnection)

// KeyManagementSystem is responsible for managing encryption and signing keys
import { KeyManagementSystem } from 'daf-libsodium'
const kms = new KeyManagementSystem(keyStore)

// Storing managed identities in the database
import { IdentityStore } from 'daf-core'
const identityStore = new IdentityStore('unique-store-name', dbConnection)

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
actionHandler.setNext(new SdrActionHandler()).setNext(new DIDCommActionHandler())

// Initializing the Core
import { Agent } from 'daf-core'
// we need defaultIdentityProvider = 'rinkeby-ethr-did'
const agent = new Agent({
  dbConnection,
  didResolver,
  identityProviders: [rinkebyIdentityProvider],
  actionHandler,
  messageHandler,
})
```

## GraphQL Server

```typescript
import { ApolloServer } from 'apollo-server'
import { Gql, Message, EventTypes } from 'daf-core'
import { W3cGql } from 'daf-w3c'
import { SdrGql } from 'daf-selective-disclosure'
import merge from 'lodash.merge'

const server = new ApolloServer({
  typeDefs: [
    Gql.baseTypeDefs,
    Gql.Core.typeDefs,
    Gql.IdentityManager.typeDefs,
    W3cGql.typeDefs,
    SdrGql.typeDefs,
  ],
  resolvers: merge(Gql.Core.resolvers, Gql.IdentityManager.resolvers, W3cGql.resolvers, SdrGql.resolvers),
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
const identity = await agent.identityManager.createIdentity()
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

```typescript
const data = {
  issuer: 'did:example:123',
  replyUrl: 'https://example.com/didcomm',
  tag: 'session-123',
  claims: [
    {
      reason: 'We are required by law to collect this information',
      claimType: 'name',
      essential: true,
    },
    {
      reason: 'You can get %30 discount if you are a member of the club',
      credentialContext: 'https://www.w3.org/2018/credentials/v1',
      credentialType: 'ClubMembership',
      claimType: 'status',
      claimValue: 'member',
      issuers: [
        {
          did: 'did:ethr:567',
          url: 'https://join-the-club.partner1.com',
        },
        {
          did: 'did:ethr:659',
          url: 'https://ecosystem.io',
        },
      ],
    },
  ],
  credentials: ['JWT-public-profile...'],
}
```

### Typescript

```typescript
const sdrJwt = await agent.handleAction({
  type: 'sign.sdr.jwt',
  data,
})
```

### GraphQL

```graphql
mutation signSdrJwt($data: SDRInput!) {
  signSdr(data: $data)
}
```

## Show as QR Code

```typescript
const url = encodeURI('https://example.com/ssi?c_i=') + sdrJwt
```

```html
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
  to: 'did:example:3456',
  type: 'jwt', // this is a "subprotocol"
  body: sdrJwt,
}
```

### Typescript

```typescript
const message: Message = await agent.handleAction({
  type: 'send.message.didcomm-alpha-1',
  save: true,
  data,
})

console.log(message.id) // 443230-234234-123123
console.log(message.type) // sdr
```

### GraphQL

```graphql
mutation sendMessageDidCommAlpha1($data: SendMessageInput!, $save: Boolean = true) {
  sendMessageDidCommAlpha1(data: $data, save: $save) {
    id
  }
}
```

# Handle incoming message

```typescript
const raw = 'https://example.com/ssi?c_i=JWT...'
const meta = [
  // this is optional
  { type: 'qrcode' },
  { type: 'foo', value: 'bar' },
]
```

## Typescript

```typescript
const sdrMessage: Message = await agent.handleMessage({
  raw,
  meta,
  save: true, // default = true
})
console.log(message.type) // 'sdr'
console.log(message.credentials) // public profile
```

## GraphQL

```graphql
mutation handleMessage($raw: String!, $metaData: [MetaDataInput]) {
  handleMessage(raw: $raw, metaData: $meta, save: true) {
    id
    type
  }
}
```

# Sign and save Verifiable Credential

```typescript
const data = {
  '@context': ['https://www.w3.org/2018/credentials/v1'],
  type: ['VerifiableCredential'],
  issuer: 'did:example:1234',
  credentialSubject: {
    id: 'did:example:1234',
    name: 'Alice',
  },
  credentialStatus: {
    type: 'EthrStatusRegistry2019',
    id: 'rinkeby:0x97fd27892cdcD035dAe1fe71235c636044B59348',
  },
}
```

## Typescript

```typescript
const nameVc: Credential = await agent.handleAction({
  type: 'sign.w3c.vc.jwt',
  save: true,
  data,
})

console.log(nameVc.raw) // JWT....
console.log(nameVc.claims) // [Claim({type: 'name', value: 'Alice', ...})]
```

## GraphQL

```graphql
mutation signCredentialJwt($data: SignCredentialInput!) {
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
const dbConnection = await agent.dbConnection
const nameClaims = await dbConnection.getRepository(Claim).find({
  where: {
    subject: 'did:example:1234',
    type: 'name',
  },
  relations: ['credential'],
})

const nameVc = nameClaims[0]?.credential

const memberClaims = await dbConnection.getRepository(Claim).find({
  where: {
    issuer: In(['did:ethr:567', 'did:ethr:659']),
    subject: 'did:example:1234',
    type: 'status',
    value: 'member',
  },
  relations: ['credential'],
})

const memberVc = memberClaims[0]?.credential
```

### GraphQL

```typescript
const input = {
  where: [
    { column: 'issuer', value: ['did:ethr:567', 'did:ethr:659'] },
    { column: 'subject', value: ['did:example:1234'] },
    { column: 'type', value: ['member'] },
    { column: 'value', value: ['status'] },
  ],
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
import { findCredentialsForSdr } from 'daf-selective-disclosure'
const result = await findCredentialsForSdr(agent.dbConnection, sdr, 'did:example:1234')

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
        issuer {
          did
        }
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
  issuer: 'did:example:1234',
  subject: 'did:example:3456',
  tag: sdrMessage.data.tag,
  '@context': ['https://www.w3.org/2018/credentials/v1'],
  type: ['VerifiablePresentation'],
  verifiableCredential: [nameVc.raw, memberVc.raw],
}
```

## Typescript

```typescript
const vp: Presentation = await agent.handleAction({
  type: 'sign.w3c.vp.jwt',
  save: true,
  data,
})

console.log(vp.raw) // JWT....
```

## GraphQL

```graphql
mutation signPresentationJwt($data: SignPresentationInput!) {
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
  to: 'did:example:3456',
  type: 'jwt',
  body: vp.raw,
}
```

## Typescript

```typescript
const message: Message = await agent.handleAction({
  type: 'send.message.didcomm-alpha-1',
  save: true,
  url,
  data,
})
console.log(message.id) // 443230-234234-123123
console.log(message.type) // w3c.vp
```

## GraphQL

```graphql
mutation sendMessageDidCommAlpha1($data: SendMessageDidCommAlpha1Input!, $url: String) {
  sendMessageDidCommAlpha1(data: $data, url: $url, save: true) {
    id
  }
}
```

# Checking if VP has all requested VCs

```typescript
const sdr = {
  issuer: 'did:example:123',
  replyUrl: 'https://example.com/didcomm',
  tag: 'session-123',
  claims: [
    {
      reason: 'We are required by law to collect this information',
      claimType: 'name',
      essential: true,
    },
    {
      reason: 'You can get %30 discount if you are a member of the club',
      credentialContext: 'https://www.w3.org/2018/credentials/v1',
      credentialType: 'ClubMembership',
      claimType: 'status',
      claimValue: 'member',
      issuers: [
        {
          did: 'did:ethr:567',
          url: 'https://join-the-club.partner1.com',
        },
        {
          did: 'did:ethr:659',
          url: 'https://ecosystem.io',
        },
      ],
    },
  ],
  credentials: ['JWT-public-profile...'],
}
```

### Typescript

```typescript
import { validatePresentationAgainstSdr } from 'daf-selective-disclosure'

//...

const result = await validatePresentationAgainstSdr(presentation, sdr)

console.log(result)
```

```javascript
{
  valid: true,
  claims: [
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
}
```

### GraphQL

```typescript
const hash = 'presentation-hash-12345'
```

```graphql
query presentation($hash: ID!, $sdr: SDRInput!) {
  presentation(hash: $hash) {
    validateAgainstSdr(data: $sdr) {
      valid
    }
  }
}
```

# Querying data

## Entities

- Identity
- Message
- Presentation
- Credential
- Claim

There are too many ways of querying data to fit into this documentation.
What follows are couple of examples

https://typeorm.io/#/find-options

## Identity

Fields

- did
- provider

### Typescript

```typescript
import { Identity, Claim } from 'daf-core'
const dbConnection = await agent.dbConnection
const identity = await dbConnection.getRepository(Identity).findOne('did:example:123')
const name = await identity.getLatestClaimValue(agent.dbConnection, { type: 'name' })
const profilePicture = await identity.getLatestClaimValue(agent.dbConnection, { type: 'profilePicture' })
const issuedClaims = await dbConnection.getRepository(Claim).find({ where: { issuer: identity.did } })
```

### GraphQL

```graphql
query identity($did: String!) {
  identity(did: $did) {
    did
    shortDid
    name: latestClaimValue(type: "name")
    profilePicture: latestClaimValue(type: "profilePicture")
  }
  issuedClaims: claims(input: { where: [{ column: issuer, value: [$did] }] }) {
    subject {
      did
    }
    type
    value
  }
}
```

## Message

Fields

- id
- saveDate
- updateDate
- createdAt
- expiresAt
- threadId
- type
- raw
- data
- replyTo
- replyUrl
- from
- to
- metaData
- presentations
- credentials

### Typescript

```typescript
import { Message } from 'daf-core'
const dbConnection = await agent.dbConnection
const messages = await dbConnection.getRepository(Message).find({
  take: 5,
  where: {
    type: 'sdr',
  },
})
```

### GraphQL

```graphql
query {
  messages(input: { where: [{ column: type, value: "sdr" }], take: 5 }) {
    id
    from {
      did
    }
    to {
      did
    }
  }
}
```

## Presentation

Fields

- hash
- issuer
- audience
- issuanceDate
- expirationDate
- data
- context
- type
- credentials
- messages

### Typescript

```typescript
import { Presentation } from 'daf-core'
const dbConnection = await agent.dbConnection
const presentations = await dbConnection.getRepository(Presentation).find({
  where: {
    issuer: 'did:web:example.com',
    type: 'VerifiablePresentation,KYC',
  },
  relations: ['credentials'],
})
```

### GraphQL

```graphql
query {
  presentations(
    input: {
      where: [
        { column: issuer, value: "did:web:example.com" }
        { column: type, value: "VerifiablePresentation,KYC" }
      ]
    }
  ) {
    audience {
      did
    }
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

- hash
- issuer
- subject
- issuanceDate
- expirationDate
- context
- type - e.x. 'VerifiableCredential,KYC'
- data
- claims
- presentations
- messages

### Typescript

```typescript
import { Credential } from 'daf-core'
import { LessThan } from 'typeorm'
const dbConnection = await agent.dbConnection
const credentials = await dbConnection.getRepository(Credential).find({
  where: {
    subject: 'did:web:example.com',
    expirationDate: LessThan(new Date()),
  },
  relations: ['messages'],
})

// This would also return messages where these credentials were used at
```

### GraphQL

```graphql
query {
  credentials(
    input: {
      where: [
        { column: subject, value: "did:web:example.com" }
        { column: expirationDate, value: "2020-12-12T10:00:00Z", op: LessThan }
      ]
    }
  ) {
    issuer {
      did
    }
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

- hash
- issuer
- subject
- credential
- issuanceDate
- expirationDate
- context
- credentialType - e.x. 'VerifiableCredential,KYC'
- type
- value
- isObj

### Typescript

```typescript
import { Claim } from 'daf-core'
const dbConnection = await agent.dbConnection
const claims = await dbConnection.getRepository(Claim).find({
  where: {
    type: 'address',
  },
  relations: ['credential'],
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
  claims(input: { where: [{ column: type, value: "address" }] }) {
    type
    value
    isObj
  }
}
```

## Managed identities

### Typescript

```typescript
const identities = await agent.identityManager.getIdentities()
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
