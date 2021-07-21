# DID Provider for ceramic

## Example usage

```typescript
import { VeramoDidProvider } from '@veramo/ceramic'
import { DID } from 'dids'
import KeyDidResolver from 'key-did-resolver'
import CeramicClient from '@ceramicnetwork/http-client'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import { agent } from './setup.ts'

const API_URL = "https://ceramic-clay.3boxlabs.com"

const alice = await agent.didManagerGetOrCreate({
  alias: 'alice',
  provider: 'did:key'
})
const provider = new VeramoDidProvider(agent, alice.did)

const resolver = { ...KeyDidResolver.getResolver() }
const did = new DID({ provider, resolver })
await did.authenticate()

const ceramic = new CeramicClient(API_URL)
ceramic.setDID(did)

const content = { hello: 'from veramo' }
const doc = await TileDocument.create(ceramic, content)
```