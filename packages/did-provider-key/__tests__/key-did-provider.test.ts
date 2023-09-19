import { IDIDManager, IKeyManager, IResolver } from '../../core-types/src'
import { createAgent } from '../../core/src'
import { DIDManager, MemoryDIDStore } from '../../did-manager/src'
import { DIDResolverPlugin } from '../../did-resolver/src'
import { KeyManager, MemoryKeyStore, MemoryPrivateKeyStore } from '../../key-manager/src'
import { KeyManagementSystem } from '../../kms-local/src'

import { getDidKeyResolver, KeyDIDProvider } from '../src'

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
        'did:key': new KeyDIDProvider({
          defaultKms,
        }),
      },
      defaultProvider: 'did:key',
      store: new MemoryDIDStore(),
    }),
    new DIDResolverPlugin(getDidKeyResolver()),
  ],
})

describe('@veramo/did-provider-key', () => {
  it('should create identifier with no params', async () => {
    const did = await agent.didManagerCreate({})
    expect(did).toBeDefined()
    expect(did.did).toMatch(/^did:key:.*/)
  })

  it('should create identifier with Ed25519 key', async () => {
    const did = await agent.didManagerCreate({ options: { keyType: 'Ed25519' } })
    expect(did).toBeDefined()
    expect(did.did).toMatch(/^did:key:z6Mk.*/)
  })

  it('should create identifier with X25519 key', async () => {
    const did = await agent.didManagerCreate({ options: { keyType: 'X25519' } })
    expect(did).toBeDefined()
    expect(did.did).toMatch(/^did:key:z6LS.*/)
  })

  it('should create identifier with Secp256k1 key', async () => {
    const did = await agent.didManagerCreate({ options: { keyType: 'Secp256k1' } })
    expect(did).toBeDefined()
    expect(did.did).toMatch(/^did:key:zQ3s.*/)
  })

  it('should create identifier with Ed25519 key given a private key', async () => {
    const privateKeyHex = '06eb9e64569203679b36f834a4d9725c989d32a7fb52c341eae3517b3aff8ee6'
    const did = await agent.didManagerCreate({ options: { keyType: 'Ed25519', privateKeyHex } })
    expect(did).toBeDefined()
    expect(did.did).toMatch(/^did:key:z6Mkq3FR8bz4e3oDcbHhGAmfUUW7bdCtEL2vK2Fsw16Z99Vk$/)
  })

  it('should create identifier with X25519 key given a private key', async () => {
    const privateKeyHex = '06eb9e64569203679b36f834a4d9725c989d32a7fb52c341eae3517b3aff8ee6'
    const did = await agent.didManagerCreate({ options: { keyType: 'X25519', privateKeyHex } })
    expect(did).toBeDefined()
    expect(did.did).toMatch(/^did:key:z6LSk74Z9nwqCr3M6Y2JNFEz1aQUaG2Ehnvc8XGjuK9LzbkS$/)
  })

  it('should create identifier with Secp256k1 key given a private key', async () => {
    const privateKeyHex = '06eb9e64569203679b36f834a4d9725c989d32a7fb52c341eae3517b3aff8ee6'
    const did = await agent.didManagerCreate({ options: { keyType: 'Secp256k1', privateKeyHex } })
    expect(did).toBeDefined()
    expect(did.did).toMatch(/^did:key:zQ3shmh97kcXoAqLZLjjc86HB5YNPGBekgFq7W7LmpEwE5mov$/)
  })
})
