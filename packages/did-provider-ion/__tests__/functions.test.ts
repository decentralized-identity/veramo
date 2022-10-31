import { ManagedKeyInfo } from '../../core/src'
import { generatePrivateKeyHex, tempMemoryKey, toIonPrivateKeyJwk } from '../src/functions'
import { KeyIdentifierRelation, KeyType } from '../src/types/ion-provider-types'

const PRIVATE_RECOVERY_KEY_HEX = '7c90c0575643d09a370c35021c91e9d8af2c968c5f3a4bf73802693511a55b9f'
const PRIVATE_UPDATE_KEY_HEX = '7288a92f6219c873446abd1f8d26fcbbe1caa5274b47f6f086ef3e7e75dcad8b'
const PRIVATE_DID_KEY_HEX = '06eb9e64569203679b36f834a4d9725c989d32a7fb52c341eae3517b3aff8ee6'

describe('functions: key generator', () => {
  it('Secp256k1 should generate random keys', () => {
    const key1 = generatePrivateKeyHex(KeyType.Secp256k1)
    const key2 = generatePrivateKeyHex(KeyType.Secp256k1)
    const key3 = generatePrivateKeyHex(KeyType.Secp256k1)
    expect(key1).toBeDefined()
    expect(key2).toBeDefined()
    expect(key3).toBeDefined()
    expect(key1).not.toBe(key2)
    expect(key2).not.toBe(key3)
  })
  it('Secp256k1 should result in hex length 64', () => {
    expect(generatePrivateKeyHex(KeyType.Secp256k1).length).toBe(64)
  })

  it('Ed25519 should generate random keys', () => {
    const key1 = generatePrivateKeyHex(KeyType.Ed25519)
    const key2 = generatePrivateKeyHex(KeyType.Ed25519)
    const key3 = generatePrivateKeyHex(KeyType.Ed25519)
    expect(key1).toBeDefined()
    expect(key2).toBeDefined()
    expect(key3).toBeDefined()
    expect(key1).not.toBe(key2)
    expect(key2).not.toBe(key3)
  })
  it('Ed25519 should result in hex length 128', () => {
    expect(generatePrivateKeyHex(KeyType.Ed25519).length).toBe(128)
  })
})

describe('functions: ionKeys', () => {
  it('toPrivateKeyJwk should be deterministic', () => {
    const privateKeyJwk = toIonPrivateKeyJwk(PRIVATE_DID_KEY_HEX)
    expect(privateKeyJwk).toEqual({
      crv: 'secp256k1',
      d: 'BuueZFaSA2ebNvg0pNlyXJidMqf7UsNB6uNRezr_juY',
      kty: 'EC',
      x: 'aMjNCWMdeXJRg3PDzE7TE9P2xFpoL9fRkJ0toVBMB8E',
      y: 'Qz7vj0zUj6S4daGIuEMbB_Ua6Q6wOTGAo46tXLi3SxE',
    })
  })
  it('temp recovery Memory Key should be deterministic and have a commitment ', async () => {
    const tmpKey = await tempMemoryKey(KeyType.Secp256k1, PRIVATE_RECOVERY_KEY_HEX, 'test-recovery-kid', 'test-recovery-kms', {
      relation: KeyIdentifierRelation.RECOVERY,
      actionTimestamp: 2,
    })
    expect(tmpKey).toMatchObject<ManagedKeyInfo>({
      kid: 'test-recovery-kid',
      kms: 'test-recovery-kms',
      meta: {
        ion: {
          actionTimestamp: 2,
          commitment: 'EiDAQXSi7HcjJVBYAKdO2zrM4HfybmBBCWsl6PQPJ_jklA',
          relation: 'recovery',
        },
      },
      publicKeyHex:
        '04d530f20a7b3aa14a1dd4ca0aa67fc36138b6547bc91f454bda8d37f9021e0f5c24eeb53256a81d1b26ac342b00b0e7346b38f25a47c3cf233a0601714ae63b8b',
      type: 'Secp256k1',
    })
  })
  it('temp update Memory Key should be deterministic and have a commitment ', async () => {
    const tmpKey = await tempMemoryKey(KeyType.Secp256k1, PRIVATE_UPDATE_KEY_HEX, 'test-update-kid', 'test-update-kms', {
      relation: KeyIdentifierRelation.UPDATE,
      actionTimestamp: 4,
    })
    expect(tmpKey).toMatchObject<ManagedKeyInfo>({
      kid: 'test-update-kid',
      kms: 'test-update-kms',
      meta: {
        ion: {
          actionTimestamp: 4,
          commitment: 'EiBzp7YhN9mhUcZsFdxnf-lwkRU-hVbBtZWsVoJHV6jkwA',
          relation: 'update',
        },
      },
      publicKeyHex:
        '04826d51d96e9accdef1b13d9acfab61a15d5b5a6b0c1050acb68d58070a3baa0402dae4c63691a6d094537930aef1fa9116af81a6796015edb67013a2792e0b09',
      type: 'Secp256k1',
    })
  })
})
