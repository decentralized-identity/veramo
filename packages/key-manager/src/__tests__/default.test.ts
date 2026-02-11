import { AbstractKeyManagementSystem, KeyManager, MemoryKeyStore } from '../index.js'
import { IKey, ManagedKeyInfo, MinimalImportableKey, TKeyType } from '../../../core-types/src'

const TEST_KEY_TYPE = 'TEST_KEY_TYPE'
const TEST_ALG = 'TEST_ALG'

class DummyKMS extends AbstractKeyManagementSystem {
  private keys: Map<string, ManagedKeyInfo> = new Map()

  async importKey(args: Exclude<MinimalImportableKey, 'kms'>): Promise<ManagedKeyInfo> {
    if (args.type && args.type !== TEST_KEY_TYPE) {
      throw new Error('not_supported: Only TEST_KEY_TYPE is supported')
    }
    const key: ManagedKeyInfo = {
      type: args.type ?? TEST_KEY_TYPE,
      kid: args.kid || 'dummy-kid',
      publicKeyHex: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
      kms: 'dummy',
      meta: { algorithms: [TEST_ALG] },
    }
    this.keys.set(key.kid, key)
    return key
  }

  async listKeys(): Promise<ManagedKeyInfo[]> {
    return Array.from(this.keys.values())
  }

  async createKey({ type, kid }: { type: TKeyType; kid?: string }): Promise<ManagedKeyInfo> {
    if (type && type !== TEST_KEY_TYPE) {
      throw new Error('not_supported: Only TEST_KEY_TYPE is supported')
    }
    const key: ManagedKeyInfo = {
      type: type ?? TEST_KEY_TYPE,
      kid: kid ? `${kid}-but-changed-by-the-kms` : 'dummy-key-' + Math.random(),
      publicKeyHex: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
      kms: 'dummy',
      meta: { algorithms: [TEST_ALG] },
    }
    this.keys.set(key.kid, key)
    return key
  }

  async deleteKey({ kid }: { kid: string }): Promise<boolean> {
    return this.keys.delete(kid)
  }

  async sign({
    keyRef,
    algorithm,
    data,
  }: {
    keyRef: Pick<IKey, 'kid'>
    algorithm?: string
    data: Uint8Array
  }): Promise<string> {
    if (algorithm && algorithm !== TEST_ALG) {
      throw new Error('not_supported: Only TEST_ALG is supported')
    }
    if (!this.keys.has(keyRef.kid)) {
      throw new Error(`key_not_found: Key with kid ${keyRef.kid} not found`)
    }
    return 'dummy-signature-' + data.length
  }

  async sharedSecret({
    myKeyRef,
    theirKey,
  }: {
    myKeyRef: Pick<IKey, 'kid'>
    theirKey: Pick<IKey, 'publicKeyHex' | 'type'>
  }): Promise<string> {
    if (!this.keys.has(myKeyRef.kid)) {
      throw new Error(`key_not_found: Key with kid ${myKeyRef.kid} not found`)
    }
    return '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'
  }
}

describe('key-manager', () => {
  it('creates a key and signs with it', async () => {
    const kms = new DummyKMS()
    const keyManager = new KeyManager({
      store: new MemoryKeyStore(),
      kms: { dummy: kms },
    })

    const key = await keyManager.keyManagerCreate({ type: TEST_KEY_TYPE, kms: 'dummy', kid: 'test-key' })
    expect(key.type).toEqual(TEST_KEY_TYPE)
    expect(key.kid).toEqual('test-key-but-changed-by-the-kms')
    expect(key.kms).toEqual('dummy')

    const data = 'test data for signing'
    const signature = await keyManager.keyManagerSign({ keyRef: key.kid, data, algorithm: TEST_ALG })
    expect(signature).toBeDefined()
    expect(typeof signature).toBe('string')
  })

  it('imports a key and signs with it', async () => {
    const kms = new DummyKMS()
    const keyManager = new KeyManager({
      store: new MemoryKeyStore(),
      kms: { dummy: kms },
    })

    const privateKeyHex = 'dummy-private-key-hex'
    const key = await keyManager.keyManagerImport({
      kid: 'imported-key',
      type: TEST_KEY_TYPE,
      privateKeyHex,
      kms: 'dummy',
    })
    expect(key.type).toEqual(TEST_KEY_TYPE)
    expect(key.kid).toEqual('imported-key')
    expect(key.kms).toEqual('dummy')

    const data = 'test data for signing'
    const signature = await keyManager.keyManagerSign({ keyRef: 'imported-key', data, algorithm: TEST_ALG })
    expect(signature).toBeDefined()
    expect(typeof signature).toBe('string')
  })

  it('gets key management systems', async () => {
    const kms = new DummyKMS()
    const keyManager = new KeyManager({
      store: new MemoryKeyStore(),
      kms: { local: kms, dummy: kms },
    })

    const systems = await keyManager.keyManagerGetKeyManagementSystems()
    expect(systems).toEqual(['local', 'dummy'])
  })

  it('gets a key', async () => {
    const kms = new DummyKMS()
    const keyManager = new KeyManager({
      store: new MemoryKeyStore(),
      kms: { dummy: kms },
    })

    const createdKey = await keyManager.keyManagerCreate({
      type: TEST_KEY_TYPE,
      kms: 'dummy',
      kid: 'get-test-key',
    })
    const key = await keyManager.keyManagerGet({ kid: createdKey.kid })
    expect(key.type).toEqual(TEST_KEY_TYPE)
    expect(key.kms).toEqual('dummy')
  })

  it('deletes a key', async () => {
    const kms = new DummyKMS()
    const keyManager = new KeyManager({
      store: new MemoryKeyStore(),
      kms: { dummy: kms },
    })

    const key = await keyManager.keyManagerCreate({
      type: TEST_KEY_TYPE,
      kms: 'dummy',
      kid: 'delete-test-key',
    })
    const result = await keyManager.keyManagerDelete({ kid: key.kid })
    expect(result).toBe(true)

    await expect(keyManager.keyManagerGet({ kid: key.kid })).rejects.toThrow()
  })

  it('fails to encrypt and decrypts JWE because of unsupported algorithms', async () => {
    const kms = new DummyKMS()
    const keyManager = new KeyManager({
      store: new MemoryKeyStore(),
      kms: { dummy: kms },
    })

    const senderKey = await keyManager.keyManagerCreate({ type: TEST_KEY_TYPE, kms: 'dummy', kid: 'sender' })
    const recipientKey = {
      type: TEST_KEY_TYPE,
      publicKeyHex: 'dummy',
      kid: 'recipient',
    }

    const data = 'secret message'
    await expect(
      keyManager.keyManagerEncryptJWE({ kid: senderKey.kid, to: recipientKey, data }),
    ).rejects.toThrow('not_supported: The recipient public key type is not supported')
  })

  it('computes shared secret', async () => {
    const kms = new DummyKMS()
    const keyManager = new KeyManager({
      store: new MemoryKeyStore(),
      kms: { dummy: kms },
    })

    const myKey = await keyManager.keyManagerCreate({ type: TEST_KEY_TYPE, kms: 'dummy', kid: 'my-key' })
    const theirKey = {
      type: TEST_KEY_TYPE,
      publicKeyHex: 'really doesnt matter for the dummy kms',
    }

    const secret = await keyManager.keyManagerSharedSecret({ secretKeyRef: myKey.kid, publicKey: theirKey })
    expect(secret).toEqual('0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef')
  })

  it('signs JWT', async () => {
    const kms = new DummyKMS()
    const keyManager = new KeyManager({
      store: new MemoryKeyStore(),
      kms: { dummy: kms },
    })

    const key = await keyManager.keyManagerCreate({ type: TEST_KEY_TYPE, kms: 'dummy', kid: 'jwt-key' })
    const data = 'test jwt data'
    const signature = await keyManager.keyManagerSignJWT({ kid: key.kid, data })
    expect(signature).toEqual('dummy-signature-13')
  })
})
