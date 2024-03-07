import { extractPublicKeyHex, getChainId, getEthereumAddress } from '../did-utils.js'
import { bytesToMultibase, hexToBytes } from '../encodings.js'

describe('@veramo/utils did utils', () => {
  it(`should return correct chainId for did:ethr`, () => {
    expect(() =>
      getChainId({
        id: 'did:ethr:0x1B54DaD834f2017ab66C1a1ffF74425889141e51#controller',
        type: 'EcdsaSecp256k1RecoveryMethod2020',
        controller: 'did:ethr:0x1B54DaD834f2017ab66C1a1ffF74425889141e51',
        blockchainAccountId: 'did:key:0x32234234234234',
      }),
    ).toThrow()
    expect(
      getChainId({
        id: 'did:ethr:0x1B54DaD834f2017ab66C1a1ffF74425889141e51#controller',
        type: 'EcdsaSecp256k1RecoveryMethod2020',
        controller: 'did:ethr:0x1B54DaD834f2017ab66C1a1ffF74425889141e51',
        blockchainAccountId: 'eip155:1:0x1B54DaD834f2017ab66C1a1ffF74425889141e51',
      }),
    ).toEqual(1)
    expect(
      getChainId({
        id: 'did:ethr:0x1B54DaD834f2017ab66C1a1ffF74425889141e51#controller',
        type: 'EcdsaSecp256k1RecoveryMethod2020',
        controller: 'did:ethr:0x1B54DaD834f2017ab66C1a1ffF74425889141e51',
        blockchainAccountId: 'eip155:1:did:ethr:0x1B54DaD834f2017ab66C1a1ffF74425889141e51',
      }),
    ).toEqual(1)
    expect(
      getChainId({
        id: 'did:ethr:0x1B54DaD834f2017ab66C1a1ffF74425889141e51#controller',
        type: 'EcdsaSecp256k1RecoveryMethod2020',
        controller: 'did:ethr:goerli:0x1B54DaD834f2017ab66C1a1ffF74425889141e51',
        blockchainAccountId: 'eip155:5:0x1B54DaD834f2017ab66C1a1ffF74425889141e51',
      }),
    ).toEqual(5)
  })

  it('should return correct chainId for did:pkh', () => {
    expect(
      getChainId({
        "id": "did:pkh:eip155:59144:0x19711CD19e609FEBdBF607960220898268B7E24b#blockchainAccountId",
        "type": "EcdsaSecp256k1RecoveryMethod2020",
        "controller": "did:pkh:eip155:59144:0x19711CD19e609FEBdBF607960220898268B7E24b",
        "blockchainAccountId": "eip155:59144:0x19711CD19e609FEBdBF607960220898268B7E24b"
      }),
    ).toEqual(59144)
  })

  
  it('should throw on invalid chainId', () => {
    expect( () => {
      getChainId({
        "id": "did:pkh:eip155:59144:0x19711CD19e609FEBdBF607960220898268B7E24b#blockchainAccountId",
        "type": "EcdsaSecp256k1RecoveryMethod2020",
        "controller": "did:pkh:eip155:59144:0x19711CD19e609FEBdBF607960220898268B7E24b",
        "blockchainAccountId": "eip155:linea:0x19711CD19e609FEBdBF607960220898268B7E24b"
      })
    }).toThrowError("chainId is not a number")
  })

  
  it('should return blockchainAccountId for did:ethr', () => {
    const verificationMethod = {
      id: 'did:ethr:0x1B54DaD834f2017ab66C1a1ffF74425889141e51#controller',
      type: 'EcdsaSecp256k1RecoveryMethod2020',
      controller: 'did:ethr:0x1B54DaD834f2017ab66C1a1ffF74425889141e51',
      blockchainAccountId: 'eip155:1:0x1B54DaD834f2017ab66C1a1ffF74425889141e51',
    }

    expect(getEthereumAddress(verificationMethod)).toEqual(
      '0x1B54DaD834f2017ab66C1a1ffF74425889141e51'.toLowerCase(),
    )
  })

  it('should return blockchainAccountId for did:key', () => {
    const verificationMethod = {
      id: 'did:key:zQ3shdHG4u9wPDoEzSokyLm3readHkrpYaXFf9jbc8Eiz1UM5#zQ3shdHG4u9wPDoEzSokyLm3readHkrpYaXFf9jbc8Eiz1UM5',
      type: 'EcdsaSecp256k1VerificationKey2019',
      controller: 'did:key:zQ3shdHG4u9wPDoEzSokyLm3readHkrpYaXFf9jbc8Eiz1UM5',
      publicKeyJwk: {
        kty: 'EC',
        crv: 'secp256k1',
        x: '6805tExt2N3AcS9cxs_RJT_RtAkfK6rqIix5B4k0oEg',
        y: 'qw0mojIWWljYFYHvsSkcBfaUVfeSf1YEbyFZmzAif2Q',
      },
    }

    expect(getEthereumAddress(verificationMethod)).toEqual(
      '0x923f7158062db4761a8917ad1628d11536c5f07b'.toLowerCase(),
    )
  })

  it('should convert to multibase and back', async () => {
    const publicKeyHex = '6bb3f30242ac89bb6baa169fd5d1fea5adb61ce5b3cfee9e157e699a51983869'
    const computedMultibase = bytesToMultibase(hexToBytes(publicKeyHex), 'base58btc', 'ed25519-pub')
    // // multibase
    // let expectedMultibase = `z8FRmkyRH9xAsLCk51yXN2Qy6uq4eN4iAesa3v3Hv889v`;

    // // multibase + multicodec
    let expectedMultibase = `z6MkmhgpMDfiVVfLShamhYVCsWX6jQLVmwxXLtUykKFw3LwJ`

    expect(computedMultibase).toEqual(expectedMultibase)

    const computed = extractPublicKeyHex({
      publicKeyMultibase: expectedMultibase,
      type: 'Ed25519VerificationKey2020',
      id: 'dummy key',
      controller: 'dummy controller',
    })

    expect(computed).toEqual({ publicKeyHex, keyType: 'Ed25519' })
  })

  it('should convert to multibase and back', async () => {
    const publicKeyHex = '6bb3f30242ac89bb6baa169fd5d1fea5adb61ce5b3cfee9e157e699a51983869'
    const computedMultibase = bytesToMultibase(hexToBytes(publicKeyHex), 'base58btc', 'ed25519-pub')

    // // multibase + multicodec
    let expectedMultibase = `z6MkmhgpMDfiVVfLShamhYVCsWX6jQLVmwxXLtUykKFw3LwJ`

    expect(computedMultibase).toEqual(expectedMultibase)

    const computedXMultibase = bytesToMultibase(hexToBytes(publicKeyHex), 'base58btc', 'x25519-pub')
    let expectedXMultibase = `z6LSivbwHHE9FQtcRb7qYd3KM1Bakybm4ftKXrHjQVwSqVvg`

    expect(computedXMultibase).toEqual(expectedXMultibase)

    const computed = extractPublicKeyHex({
      publicKeyMultibase: expectedMultibase,
      type: 'Ed25519VerificationKey2020',
      id: 'dummy key',
      controller: 'dummy controller',
    })

    expect(computed).toEqual({ publicKeyHex, keyType: 'Ed25519' })
  })
})
