import { describe, expect, it } from 'vitest'
import { IDIDManager, IKeyManager, IResolver } from '../../core-types/src/index.js'
import { createAgent } from '../../core/src/index.js'
import { DIDManager, MemoryDIDStore } from '../../did-manager/src/index.js'
import { DIDResolverPlugin } from '../../did-resolver/src/index.js'
import { KeyManager, MemoryKeyStore, MemoryPrivateKeyStore } from '../../key-manager/src/index.js'
import { KeyManagementSystem } from '../../kms-local/src/index.js'

import { getDidKeyResolver, KeyDIDProvider } from '../src/index.js'

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
    const did = await agent.didManagerCreate({
      options: {
        key: {
          type: 'Ed25519',
        }
      }
    })
    expect(did).toBeDefined()
    expect(did.did).toMatch(/^did:key:z6Mk.*/)
  })

  it('should create identifier with X25519 key', async () => {
    const did = await agent.didManagerCreate({
      options: {
        key: {
          type: 'X25519'
        }
      }
    })
    expect(did).toBeDefined()
    expect(did.did).toMatch(/^did:key:z6LS.*/)
  })

  it('should create identifier with Secp256k1 key', async () => {
    const did = await agent.didManagerCreate({
      options: {
        key: {
          type: 'Secp256k1'
        }
      }
    })
    expect(did).toBeDefined()
    expect(did.did).toMatch(/^did:key:zQ3s.*/)
  })

  it('should create identifier with Ed25519 key ref', async () => {
    const privateKeyHex = '06eb9e64569203679b36f834a4d9725c989d32a7fb52c341eae3517b3aff8ee6'
    const key = await agent.keyManagerImport({
      kms: defaultKms,
      type: 'Ed25519',
      privateKeyHex
    })
    const did = await agent.didManagerCreate({
      options: {
        keyRef: key.kid
      }
    })
    expect(did).toBeDefined()
    expect(did.did).toMatch(/^did:key:z6Mkq3FR8bz4e3oDcbHhGAmfUUW7bdCtEL2vK2Fsw16Z99Vk$/)
  })

  it('should create identifier with X25519 key ref', async () => {
    const privateKeyHex = '06eb9e64569203679b36f834a4d9725c989d32a7fb52c341eae3517b3aff8ee6'
    const key = await agent.keyManagerImport({
      kms: defaultKms,
      type: 'X25519',
      privateKeyHex
    })
    const did = await agent.didManagerCreate({
      options: {
        keyRef: key.kid
      }
    })
    expect(did).toBeDefined()
    expect(did.did).toMatch(/^did:key:z6LSk74Z9nwqCr3M6Y2JNFEz1aQUaG2Ehnvc8XGjuK9LzbkS$/)
  })

  it('should create identifier with Secp256k1 key ref', async () => {
    const privateKeyHex = '06eb9e64569203679b36f834a4d9725c989d32a7fb52c341eae3517b3aff8ee6'
    const key = await agent.keyManagerImport({
      kms: defaultKms,
      type: 'Secp256k1',
      privateKeyHex
    })
    const did = await agent.didManagerCreate({
      options: {
        keyRef: key.kid
      }
    })
    expect(did).toBeDefined()
    expect(did.did).toMatch(/^did:key:zQ3shmh97kcXoAqLZLjjc86HB5YNPGBekgFq7W7LmpEwE5mov$/)
  })

  it('should create identifier with Ed25519 key given a private key', async () => {
    const privateKeyHex = '06eb9e64569203679b36f834a4d9725c989d32a7fb52c341eae3517b3aff8ee6'
    const did = await agent.didManagerCreate({
      options: {
        key: {
          type: 'Ed25519',
          privateKeyHex
        }
      }
    })
    expect(did).toBeDefined()
    expect(did.did).toMatch(/^did:key:z6Mkq3FR8bz4e3oDcbHhGAmfUUW7bdCtEL2vK2Fsw16Z99Vk$/)
  })

  it('should create identifier with X25519 key given a private key', async () => {
    const privateKeyHex = '06eb9e64569203679b36f834a4d9725c989d32a7fb52c341eae3517b3aff8ee6'
    const did = await agent.didManagerCreate({
      options: {
        key: {
          type: 'X25519',
          privateKeyHex
        }
      }
    })
    expect(did).toBeDefined()
    expect(did.did).toMatch(/^did:key:z6LSk74Z9nwqCr3M6Y2JNFEz1aQUaG2Ehnvc8XGjuK9LzbkS$/)
  })

  it('should create identifier with Secp256k1 key given a private key', async () => {
    const privateKeyHex = '06eb9e64569203679b36f834a4d9725c989d32a7fb52c341eae3517b3aff8ee6'
    const did = await agent.didManagerCreate({
      options: {
        key: {
          type: 'Secp256k1',
          privateKeyHex
        }
      }
    })
    expect(did).toBeDefined()
    expect(did.did).toMatch(/^did:key:zQ3shmh97kcXoAqLZLjjc86HB5YNPGBekgFq7W7LmpEwE5mov$/)
  })

  describe('deprecated config format', () => {
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
})
