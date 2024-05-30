import { IDIDManager, IKeyManager, IResolver } from '../../core-types/src'
import { createAgent } from '../../core/src'
import { DIDManager, MemoryDIDStore } from '../../did-manager/src'
import { DIDResolverPlugin } from '../../did-resolver/src'
import { KeyManager, MemoryKeyStore, MemoryPrivateKeyStore } from '../../key-manager/src'
import { KeyManagementSystem } from '../../kms-local/src'
import { getDidOydResolver, OydDIDProvider } from '../src'

const defaultKms = 'mem'

const agent = createAgent<IKeyManager & IDIDManager & IResolver>({
  plugins: [
    new KeyManager({
      store: new MemoryKeyStore(),
      kms: {
        [defaultKms]: new KeyManagementSystem(new MemoryPrivateKeyStore()),
      },
    }),
    new DIDManager({
      providers: {
        'did:oyd': new OydDIDProvider({
          defaultKms,
        }),
      },
      defaultProvider: 'did:oyd',
      store: new MemoryDIDStore(),
    }),
    new DIDResolverPlugin(getDidOydResolver()),
  ],
})

describe('@ownyourdata/did-provider-oyd', () => {
  it('should create identifier with no params', async () => {
    const did = await agent.didManagerCreate({})
    expect(did).toBeDefined()
    expect(did.did).toMatch(/^did:oyd:.*/)
  })

  it('should create identifier that includes Ed25519 key', async () => {
    const did = await agent.didManagerCreate({})    
    expect(did).toBeDefined()
    expect(did.keys).toBeDefined();
    expect(did.keys[0].type).toBe('Ed25519')
  })

  it('should create identifier with Ed25519 key given private keys', async () => {
    const privateDocKey = 'z1S5dmSbkkYEkWetottHTfmWfr72YyrAVQdnce7yDz7yV1Cb'
    const privateRevKey = 'z1S5hLvR2htiLL2FPGxHrWTLeDwi5Xz7tQapNhtfxUhocp9x'
    const did = await agent.didManagerCreate({ options: { ts: 1, doc_enc: privateDocKey, rev_enc: privateRevKey } })
    expect(did).toBeDefined()
    expect(did.did).toMatch(/^did:oyd:zQmWHqu9XsLWHj2FundD6UAKcuTDJFP8uMDuPUhCDZ3dfLK$/)
  })

  test.todo('should have a test for update identifier');
  // it('should update an identifier with given private key', async () => {
  // })

  test.todo('should have a test for deactivate identifier');
  // it('should deactivate an identifier with given private key', async () => {
  // })
})
