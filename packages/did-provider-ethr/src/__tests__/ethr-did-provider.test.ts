import { IDIDManager, IKeyManager, MinimalImportableKey } from '@veramo/core-types'
import { DIDManager, MemoryDIDStore } from '../../../did-manager/src'
import { EthrDIDProvider } from '../ethr-did-provider'
import { createAgent } from '../../../core/src'
import { KeyManager, MemoryKeyStore, MemoryPrivateKeyStore } from '../../../key-manager/src'
import { KeyManagementSystem } from '../../../kms-local/src'

const PROVIDER = 'did:ethr:sepolia'
const MOCK_DID = 'did:ethr:sepolia:0x76d331386cec35862a73aabdbfa5ef97cdac58cf'
const KMS = 'local'
const CONTROLLER_KEY = Object.freeze({
  type: 'Secp256k1',
  kid: 'controller-key',
  publicKeyHex:
    '3fdecd32358c5c3343f1096217baaf4ffffc68d64f5d82f3fb924e60191f6f3c0a46161f0f425d2c48ced2ec9a95f6af1993cdf0525250a4702407bce37f6269',
  privateKeyHex: 'f090b28a3bd279049710908e913d1644df061a6316fe3e17792a18e5267c4bd5',
  meta: {
    algorithms: [
      'ES256K',
      'ES256K-R',
      'eth_signTransaction',
      'eth_signTypedData',
      'eth_signMessage',
      'eth_rawSign',
    ],
  },
  kms: KMS,
}) satisfies MinimalImportableKey

const INFURA_API_KEY = '3586660d179141e3801c3895de1c2eba'

const ethrDidProvider = new EthrDIDProvider({
  defaultKms: KMS,
  network: 'sepolia',
  registry: '0x03d5003bf0e79c5f5223588f347eba39afbc3818',
  rpcUrl: `https://sepolia.infura.io/v3/${INFURA_API_KEY}`,
})

const agent = createAgent<IKeyManager, IDIDManager>({
  plugins: [
    new KeyManager({
      store: new MemoryKeyStore(),
      kms: {
        [KMS]: new KeyManagementSystem(new MemoryPrivateKeyStore()),
      },
    }),
    new DIDManager({
      providers: { [PROVIDER]: ethrDidProvider },
      defaultProvider: PROVIDER,
      store: new MemoryDIDStore(),
    }),
  ],
})

describe('EthrDIDProvider', () => {
  beforeAll(async () => {
    await agent.keyManagerImport(CONTROLLER_KEY)
    await agent.didManagerImport({
      did: MOCK_DID,
      provider: PROVIDER,
      controllerKeyId: CONTROLLER_KEY.kid,
      keys: [CONTROLLER_KEY],
      services: [],
    })
  })

  describe('adding keys', () => {
    it('returns the signed addKey transaction parameters for an Ed25519 key type', async () => {
      expect.assertions(11)
      const ed25519Key: MinimalImportableKey = {
        kms: KMS,
        kid: 'test-ed25519-key',
        type: 'Ed25519',
        privateKeyHex: 'f88e9aa3dd651d1abdfb6770159d81d2564728eff8b683b0a3041cf277b3ded2',
        publicKeyHex: 'cfdf62bdafc9fa7add58270ff29d499d649a85d0e906a1e1a92c877188d6b163',
        meta: { algorithms: ['EdDSA', 'Ed25519'] },
      }
      const importedEd25519Key = await agent.keyManagerImport(ed25519Key)
      const params = {
        did: MOCK_DID,
        key: importedEd25519Key,
        options: {
          signOnly: true,
        },
      }
      const [attrName, attrValue, ttl, signature, options] = await agent.didManagerAddKey(params)
      expect(attrName).toEqual('did/pub/Ed25519/veriKey/hex')
      expect(attrValue).toContain(ed25519Key.publicKeyHex)
      expect(attrValue.slice(0, 2)).toBe('0x')
      expect(ttl).toBe(86_400)
      expect(signature).toBeDefined()
      expect(typeof signature.sigV).toBe('number')
      expect(typeof signature.sigR).toBe('string')
      expect(signature.sigR).toContain('0x')
      expect(typeof signature.sigS).toBe('string')
      expect(signature.sigS).toContain('0x')
      expect(options).toEqual({ signOnly: true, gasLimit: 100_000 })
    })

    it('returns the signed removeKey transaction parameters for an Ed25519 key type', async () => {
      expect.assertions(10)
      const ed25519Key: MinimalImportableKey = {
        kms: KMS,
        kid: 'test-ed25519-key-remove',
        type: 'Ed25519',
        privateKeyHex: 'f88e9aa3dd651d1abdfb6770159d81d2564728eff8b683b0a3041cf277b3ded2',
        publicKeyHex: 'cfdf62bdafc9fa7add58270ff29d499d649a85d0e906a1e1a92c877188d6b163',
        meta: { algorithms: ['EdDSA', 'Ed25519'] },
      }
      const importedEd25519Key = await agent.keyManagerImport(ed25519Key)
      await agent.didManagerImport({
        did: MOCK_DID,
        provider: PROVIDER,
        controllerKeyId: CONTROLLER_KEY.kid,
        keys: [CONTROLLER_KEY, ed25519Key],
      })
      const params = {
        did: MOCK_DID,
        kid: importedEd25519Key.kid,
        options: {
          signOnly: true,
        },
      }
      const [attrName, attrValue, signature, options] = await agent.didManagerRemoveKey(params)
      console.log('attrName', attrName)
      console.log('attrValue', attrValue)
      console.log('signature', signature)
      console.log('options', options)
      expect(attrName).toEqual('did/pub/Ed25519/veriKey/hex')
      expect(attrValue).toContain(ed25519Key.publicKeyHex)
      expect(attrValue.slice(0, 2)).toBe('0x')
      expect(signature).toBeDefined()
      expect(typeof signature.sigV).toBe('number')
      expect(typeof signature.sigR).toBe('string')
      expect(signature.sigR).toContain('0x')
      expect(typeof signature.sigS).toBe('string')
      expect(signature.sigS).toContain('0x')
      expect(options).toEqual({ signOnly: true, gasLimit: 100_000 })
    })
  })

  describe('adding services', () => {
    it('returns the signed add service endpoint transaction parameters', async () => {
      expect.assertions(10)
      const type = 'DIDCommMessaging'
      const params = {
        did: MOCK_DID,
        service: {
          id: `${MOCK_DID}#${type}`,
          type,
          serviceEndpoint: 'this-is-a-new-service-endpoint',
        },
        options: { signOnly: true },
      }

      const [attrName, attrValue, ttl, signature, options] = await agent.didManagerAddService(params)
      expect(attrName).toEqual('did/svc/DIDCommMessaging')
      expect(attrValue).toBe('this-is-a-new-service-endpoint')
      expect(ttl).toBe(86_400)
      expect(signature).toBeDefined()
      expect(typeof signature.sigV).toBe('number')
      expect(typeof signature.sigR).toBe('string')
      expect(signature.sigR).toContain('0x')
      expect(typeof signature.sigS).toBe('string')
      expect(signature.sigS).toContain('0x')
      expect(options).toEqual({ signOnly: true, gasLimit: 100_000 })
    })

    it('returns the signed remove service endpoint transaction parameters', async () => {
      expect.assertions(9)
      const type = 'DIDCommMessaging'
      const params = {
        did: MOCK_DID,
        id: `${MOCK_DID}#${type}`,
        options: { signOnly: true },
      }
      const [attrName, attrValue, signature, options] = await agent.didManagerRemoveService(params)
      expect(attrName).toEqual('did/svc/DIDCommMessaging')
      expect(attrValue).toBe('this-is-a-new-service-endpoint')
      expect(signature).toBeDefined()
      expect(typeof signature.sigV).toBe('number')
      expect(typeof signature.sigR).toBe('string')
      expect(signature.sigR).toContain('0x')
      expect(typeof signature.sigS).toBe('string')
      expect(signature.sigS).toContain('0x')
      expect(options).toEqual({ signOnly: true, gasLimit: 100_000 })
    })
  })
})
