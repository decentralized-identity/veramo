import { KeyManagementSystem } from '../key-management-system.js'
import { TKeyType } from '../../../core-types/src'
import { MemoryPrivateKeyStore } from '../../../key-manager/src'
import {
  bytesToHex,
  convertEd25519PrivateKeyToX25519,
  convertEd25519PublicKeyToX25519,
  hexToBytes,
  stringToUtf8Bytes,
} from '../../../utils/src'
import { randomBytes } from '@stablelib/random'
import {
  convertPublicKeyToX25519,
  convertSecretKeyToX25519,
  generateKeyPairFromSeed,
} from '@stablelib/ed25519'

describe('@veramo/kms-local', () => {
  it('should import and convert ed25519 key', async () => {
    const kms = new KeyManagementSystem(new MemoryPrivateKeyStore())
    const privateBytes = randomBytes(32)
    const key = await kms.importKey({
      privateKeyHex: bytesToHex(privateBytes),
      type: 'Ed25519',
    })
    const pair = generateKeyPairFromSeed(privateBytes)
    expect(key.publicKeyHex).toEqual(bytesToHex(pair.publicKey))

    const xprivNoble = convertEd25519PrivateKeyToX25519(privateBytes)
    const xprivStable = convertSecretKeyToX25519(privateBytes)
    expect(bytesToHex(xprivNoble)).toEqual(bytesToHex(xprivStable))

    const xpubNoble = convertEd25519PublicKeyToX25519(hexToBytes(key.publicKeyHex))
    const xpubStable = convertPublicKeyToX25519(hexToBytes(key.publicKeyHex))
    expect(bytesToHex(xpubNoble)).toEqual(bytesToHex(xpubStable))
  })

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

describe('@veramo/kms-local Secp256r1 support', () => {
  it('should generate a managed key', async () => {
    const kms = new KeyManagementSystem(new MemoryPrivateKeyStore())
    const key = await kms.createKey({ type: 'Secp256r1' })
    expect(key.type).toEqual('Secp256r1')
    expect(key.publicKeyHex).toHaveLength(66)
    expect(key.kid).toBeDefined()
    expect(key.meta).toEqual({
      algorithms: ['ES256'],
    })
  })

  it('should import a private key', async () => {
    const kms = new KeyManagementSystem(new MemoryPrivateKeyStore())
    const privateKeyHex = '96fe4d2b4a5d3abc4679fe39aa5d4b76990ff416e6ff403a58bd722cf8352f94'
    const key = await kms.importKey({ kid: 'test', privateKeyHex, type: 'Secp256r1' })
    expect(key.type).toEqual('Secp256r1')
    expect(key.publicKeyHex).toEqual('03930fc234a12c939ccb1591a7c394088a30a32e81ac832ed8a0136e32bd73f792')
    expect(key.kid).toEqual('test')
    expect(key.meta).toEqual({
      algorithms: ['ES256'],
    })
  })

  it('should sign input data', async () => {
    const kms = new KeyManagementSystem(new MemoryPrivateKeyStore())
    const privateKeyHex = '96fe4d2b4a5d3abc4679fe39aa5d4b76990ff416e6ff403a58bd722cf8352f94'
    const data = stringToUtf8Bytes('test')

    const key = await kms.importKey({ kid: 'test', privateKeyHex, type: 'Secp256r1' })
    const signature = await kms.sign({ keyRef: key, data, algorithm: 'ES256' })
    expect(signature).toEqual(
      'tTHhkwVSNk-C84zHS_ObzpyMNVoFopwUkR_pKxSC4kPyEIZrB5L36AFWHQQhp827D9aUSMKi38yiCrSfI4h7VA',
    )
  })
})
