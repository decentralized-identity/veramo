# Storing verifiable data

Let's say we have this object:

```typescript
const obj = {
  id: 'ABC123',
  authorId: 'XYZ456',
  title: 'Lorem ipsum',
  foo: 'bar'
}
```

This would be the pseudo code for storing it to the database:

```typescript
import { db } from 'db'
await db.insert('table', obj)
```

First you need to create an identity for your user:

```typescript
import { agent } from './setup'

const author = await agent.identityManagerGetOrCreateIdentity({ 
  alias: obj.authorId
})
```

Now you can sign this object on behalf of your user and save it to the DAF DataStore:

```typescript
await agent.createVerifiableCredential({
  credential: {
    issuer: { id: author.did },
    '@context': ['https://www.w3.org/2018/credentials/v1'],
    type: ['VerifiableCredential'],
    issuanceDate: new Date().toISOString(),
    credentialSubject: obj,
  },
  proofFormat: 'jwt',
  save: true, // This param tells the agent to store it
})

```

Or you can store it in your existing database:

```typescript
const verifiableCredential = await agent.createVerifiableCredential({
  credential: {
    issuer: { id: author.did },
    '@context': ['https://www.w3.org/2018/credentials/v1'],
    type: ['VerifiableCredential'],
    issuanceDate: new Date().toISOString(),
    credentialSubject: obj,
  },
  proofFormat: 'jwt',
  save: false, // This param tells the agent to not store it
})

obj.vc = JSON.stringify(verifiableCredential)

await db.update('table', obj)
```

