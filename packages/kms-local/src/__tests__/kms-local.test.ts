import { KeyManagementSystem } from '../key-management-system'
import { TKeyType } from '@veramo/core'
import { MemoryPrivateKeyStore } from '@veramo/key-manager/src'

describe('@veramo/kms-local', () => {
  it('should compute a shared secret Ed+Ed', async () => {
    const kms = new KeyManagementSystem(new MemoryPrivateKeyStore())
    const myKey = {
      type: <TKeyType>'Ed25519',
      privateKeyHex:
        'ed3991fa33d4df22c88b78249e4d73c509c640a873a66808ad5dce774334ce94ee5072bc20355b4cd5499e04ee70853591bffa1874b1b5467dedd648d5b89ecb',
    }
    const theirKey = {
      type: <TKeyType>'Ed25519',
      publicKeyHex: 'e1d1dc2afe59bb054c44ba23ba07561d15ba83f9d1c42568ac11351fbdfd87c6',
    }
    const myKeyRef = await kms.importKey(myKey)
    const secret = await kms.sharedSecret({ myKeyRef, theirKey })
    expect(secret).toEqual('2f1d171ad32fdbd10d1b06600d70223f7298809d4a3690fa03d6b4688c7b116a')
  })

  it('should compute a shared secret Ed+X', async () => {
    const kms = new KeyManagementSystem(new MemoryPrivateKeyStore())
    const myKey = {
      type: <TKeyType>'Ed25519',
      privateKeyHex:
        'ed3991fa33d4df22c88b78249e4d73c509c640a873a66808ad5dce774334ce94ee5072bc20355b4cd5499e04ee70853591bffa1874b1b5467dedd648d5b89ecb',
    }
    const theirKey = {
      type: <TKeyType>'X25519',
      publicKeyHex: '09c99ad2fdb13247d97f4343d05cc20930db0808697e89f8f3d111a40cb6ee35',
    }
    const myKeyRef = await kms.importKey(myKey)
    const secret = await kms.sharedSecret({ myKeyRef, theirKey })
    expect(secret).toEqual('2f1d171ad32fdbd10d1b06600d70223f7298809d4a3690fa03d6b4688c7b116a')
  })

  it('should compute a shared secret X+Ed', async () => {
    const kms = new KeyManagementSystem(new MemoryPrivateKeyStore())
    const myKey = {
      type: <TKeyType>'X25519',
      privateKeyHex: '704380837434dde8a41bebcb75494578bf243fa19cd59e120a1de84e0815c84d',
    }

    const theirKey = {
      type: <TKeyType>'Ed25519',
      publicKeyHex: 'e1d1dc2afe59bb054c44ba23ba07561d15ba83f9d1c42568ac11351fbdfd87c6',
    }
    const myKeyRef = await kms.importKey(myKey)
    const secret = await kms.sharedSecret({ myKeyRef, theirKey })
    expect(secret).toEqual('2f1d171ad32fdbd10d1b06600d70223f7298809d4a3690fa03d6b4688c7b116a')
  })

  it('should compute a shared secret X+X', async () => {
    const kms = new KeyManagementSystem(new MemoryPrivateKeyStore())
    const myKey = {
      type: <TKeyType>'X25519',
      privateKeyHex: '704380837434dde8a41bebcb75494578bf243fa19cd59e120a1de84e0815c84d',
    }

    const theirKey = {
      type: <TKeyType>'X25519',
      publicKeyHex: '09c99ad2fdb13247d97f4343d05cc20930db0808697e89f8f3d111a40cb6ee35',
    }
    const myKeyRef = await kms.importKey(myKey)
    const secret = await kms.sharedSecret({ myKeyRef, theirKey })
    expect(secret).toEqual('2f1d171ad32fdbd10d1b06600d70223f7298809d4a3690fa03d6b4688c7b116a')
  })

  it('should throw on invalid myKey type', async () => {
    expect.assertions(1)
    const kms = new KeyManagementSystem(new MemoryPrivateKeyStore())
    const myKey = {
      type: <TKeyType>'Secp256k1',
      privateKeyHex: '704380837434dde8a41bebcb75494578bf243fa19cd59e120a1de84e0815c84d',
    }

    const theirKey = {
      type: <TKeyType>'X25519',
      publicKeyHex: '09c99ad2fdb13247d97f4343d05cc20930db0808697e89f8f3d111a40cb6ee35',
    }
    const myKeyRef = await kms.importKey(myKey)
    expect(kms.sharedSecret({ myKeyRef, theirKey })).rejects.toThrow('not_supported')
  })

  it('should throw on invalid theirKey type', async () => {
    expect.assertions(1)
    const kms = new KeyManagementSystem(new MemoryPrivateKeyStore())
    const myKey = {
      type: <TKeyType>'X25519',
      privateKeyHex: '704380837434dde8a41bebcb75494578bf243fa19cd59e120a1de84e0815c84d',
    }
    const myKeyRef = await kms.importKey(myKey)
    const theirKey = {
      type: <TKeyType>'Secp256k1',
      publicKeyHex: '09c99ad2fdb13247d97f4343d05cc20930db0808697e89f8f3d111a40cb6ee35',
    }

    expect(kms.sharedSecret({ myKeyRef, theirKey })).rejects.toThrow('not_supported')
  })
})
