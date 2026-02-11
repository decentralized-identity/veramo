import { KeyManager, MemoryKeyStore, MemoryPrivateKeyStore } from '../index.js'
import { KeyManagementSystem } from '../../../kms-local/src/index.js'

describe('key-manager', () => {
  it('creates a key and signs with it', async () => {
    const kms = new KeyManagementSystem(new MemoryPrivateKeyStore())
    const keyManager = new KeyManager({
      store: new MemoryKeyStore(),
      kms: { local: kms },
    })

    const key = await keyManager.keyManagerCreate({ type: 'Ed25519', kms: 'local', kid: 'test-key' })
    expect(key.type).toEqual('Ed25519')
    expect(key.kid).toEqual('test-key')
    expect(key.kms).toEqual('local')

    const data = 'test data for signing'
    const signature = await keyManager.keyManagerSign({ keyRef: 'test-key', data, algorithm: 'EdDSA' })
    expect(signature).toBeDefined()
    expect(typeof signature).toBe('string')
  })

  it('imports a key and signs with it', async () => {
    const kms = new KeyManagementSystem(new MemoryPrivateKeyStore())
    const keyManager = new KeyManager({
      store: new MemoryKeyStore(),
      kms: { local: kms },
    })

    const privateKeyHex = 'ed3991fa33d4df22c88b78249e4d73c509c640a873a66808ad5dce774334ce94ee5072bc20355b4cd5499e04ee70853591bffa1874b1b5467dedd648d5b89ecb'
    const key = await keyManager.keyManagerImport({
      kid: 'imported-key',
      type: 'Ed25519',
      privateKeyHex,
      kms: 'local',
    })
    expect(key.type).toEqual('Ed25519')
    expect(key.kid).toEqual('imported-key')
    expect(key.kms).toEqual('local')


    const data = 'test data for signing'
    const signature = await keyManager.keyManagerSign({ keyRef: 'imported-key', data, algorithm: 'EdDSA' })
    expect(signature).toBeDefined()
    expect(typeof signature).toBe('string')
  })
})
