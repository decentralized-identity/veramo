import { TAgent, IKeyManager, IDIDManager } from '../../packages/core/src'
import { VeramoDidProvider } from '../../packages/ceramic/src'
import { Ed25519Provider } from 'key-did-provider-ed25519'
import { randomBytes } from '@stablelib/random'
import { DID } from 'dids'
import KeyDidResolver from 'key-did-resolver'
import { CeramicClient } from '@ceramicnetwork/http-client'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import { CeramicApi } from '@ceramicnetwork/common'
import { getResolver as ethrDidResolver } from 'ethr-did-resolver'
import { ModelManager } from '@glazed/devtools'
import { DIDDataStore } from '@glazed/did-datastore'

const API_URL = 'https://ceramic-clay.3boxlabs.com'

type ConfiguredAgent = TAgent<IKeyManager & IDIDManager>

export default (testContext: {
  getAgent: () => ConfiguredAgent
  setup: () => Promise<boolean>
  tearDown: () => Promise<boolean>
}) => {
  describe('ceramic', () => {
    let agent: ConfiguredAgent
    const seed = randomBytes(32)

    beforeAll(async () => {
      await testContext.setup()
      agent = testContext.getAgent()
      return true
    })
    afterAll(testContext.tearDown)

    it('reference (native) implementation', async () => {
      const resolver = { ...KeyDidResolver.getResolver() }
      const provider = new Ed25519Provider(seed)
      const did = new DID({ resolver, provider })
      await did.authenticate()
      const { jws, linkedBlock } = await did.createDagJWS({ hello: 'world' })

      expect(jws).toHaveProperty('payload')
      expect(jws).toHaveProperty('signatures')
      expect(linkedBlock).toBeInstanceOf(Uint8Array)
    })

    it('authenticate and createDagJWS', async () => {
      const alice = await agent.didManagerGetOrCreate({ alias: 'alice', provider: 'did:key' })
      const provider = new VeramoDidProvider(agent, alice.did)

      const resolver = { ...KeyDidResolver.getResolver() }
      const did = new DID({ provider, resolver })
      await did.authenticate()

      const { jws, linkedBlock } = await did.createDagJWS({ hello: 'world' })

      expect(jws).toHaveProperty('payload')
      expect(jws).toHaveProperty('signatures')
      expect(linkedBlock).toBeInstanceOf(Uint8Array)
    })

    it('create TileDocument with did:key', async () => {
      const alice = await agent.didManagerGetOrCreate({ alias: 'alice', provider: 'did:key' })
      const provider = new VeramoDidProvider(agent, alice.did)

      const resolver = { ...KeyDidResolver.getResolver() }
      const did = new DID({ provider, resolver })
      await did.authenticate()

      const ceramic = new CeramicClient(API_URL)
      ceramic.setDID(did)

      const content = { hello: 'from veramo' }
      const doc = await TileDocument.create(ceramic, content)

      const doc2 = await TileDocument.load(ceramic, doc.commitId)
      expect(doc2.content).toEqual(content)
    })

    it.only('modelManager and DIDDataStore with did:key', async () => {
      const alice = await agent.didManagerGetOrCreate({ alias: 'alice', provider: 'did:key' })
      const provider = new VeramoDidProvider(agent, alice.did)

      const resolver = { ...KeyDidResolver.getResolver() }
      const did = new DID({ provider, resolver })
      await did.authenticate()

      const ceramic = new CeramicClient(API_URL)

      ceramic.setDID(did)

      const manager = new ModelManager(ceramic)

      const noteSchemaID = await manager.createSchema('SimpleNote', {
        $schema: 'http://json-schema.org/draft-07/schema#',
        title: 'SimpleNote',
        type: 'object',
        properties: {
          text: {
            type: 'string',
            title: 'text',
            maxLength: 4000,
          },
        },
      })

      const schema = manager.getSchemaURL(noteSchemaID) as string

      // Create the definition using the created schema ID
      await manager.createDefinition('myNote', {
        name: 'My note',
        description: 'A simple text note',
        schema,
      })

      // Create a tile using the created schema ID
      const tile = await manager.createTile('exampleNote', { text: 'A simple note' }, { schema })
      expect(tile).toBeTruthy()

      const model = await manager.toPublished()
      expect(model).toBeTruthy()

      const store = new DIDDataStore({ 
        //FIXME: there is a type mismatch somewhere in the dependency tree (@ceramicnetwork/common)
        ceramic: ceramic as any as CeramicApi,
        model
      })

      await store.set('myNote', { text: 'This is my note' })
      const note = await store.get('myNote')

      expect(note).toEqual({ text: 'This is my note' })
    })

    it.skip('create TileDocument with did:ethr', async () => {
      // Run a local instance of ceramic daemon in js-ceramic/packages/cli with:
      // ./bin/ceramic.js daemon --network inmemory --debug --ethereum-rpc https://mainnet.infura.io/v3/5ffc47f65c4042ce847ef66a3fa70d4c
      const API_URL = 'http://0.0.0.0:7007'
      const infuraProjectId = '5ffc47f65c4042ce847ef66a3fa70d4c'

      const alice = await agent.didManagerGetOrCreate({ alias: 'bob', provider: 'did:ethr' })
      const provider = new VeramoDidProvider(agent, alice.did)

      const resolver = {
        ...KeyDidResolver.getResolver(),
        ...ethrDidResolver({ infuraProjectId }),
      }
      const did = new DID({ provider, resolver })
      await did.authenticate()

      const ceramic = new CeramicClient(API_URL)
      ceramic.setDID(did)

      const content = { hello: 'from veramo' }
      const doc = await TileDocument.create(ceramic, content)

      const doc2 = await TileDocument.load(ceramic, doc.commitId)
      expect(doc2.content).toEqual(content)
    })
  })
}
