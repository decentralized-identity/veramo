import { getChainIdForDidEthr, getEthereumAddress } from '../did-utils.js'

describe('@veramo/utils did utils', () => {
  it(`should return correct chainId for did:ethr`, () => {
    expect(() => getChainIdForDidEthr({
      'id': 'did:ethr:0x1B54DaD834f2017ab66C1a1ffF74425889141e51#controller',
      'type': 'EcdsaSecp256k1RecoveryMethod2020',
      'controller': 'did:ethr:0x1B54DaD834f2017ab66C1a1ffF74425889141e51',
      'blockchainAccountId':'did:key:0x32234234234234'
      })).toThrow()
    expect(getChainIdForDidEthr({
      'id': 'did:ethr:0x1B54DaD834f2017ab66C1a1ffF74425889141e51#controller',
      'type': 'EcdsaSecp256k1RecoveryMethod2020',
      'controller': 'did:ethr:0x1B54DaD834f2017ab66C1a1ffF74425889141e51',
      'blockchainAccountId':'eip155:1:0x1B54DaD834f2017ab66C1a1ffF74425889141e51'
    })).toEqual(1)
    expect(getChainIdForDidEthr({
      'id': 'did:ethr:0x1B54DaD834f2017ab66C1a1ffF74425889141e51#controller',
      'type': 'EcdsaSecp256k1RecoveryMethod2020',
      'controller': 'did:ethr:0x1B54DaD834f2017ab66C1a1ffF74425889141e51',
      'blockchainAccountId':'eip155:1:did:ethr:0x1B54DaD834f2017ab66C1a1ffF74425889141e51'
    })).toEqual(1)
    expect(getChainIdForDidEthr({
      'id': 'did:ethr:0x1B54DaD834f2017ab66C1a1ffF74425889141e51#controller',
      'type': 'EcdsaSecp256k1RecoveryMethod2020',
      'controller': 'did:ethr:goerli:0x1B54DaD834f2017ab66C1a1ffF74425889141e51',
      'blockchainAccountId':'eip155:5:0x1B54DaD834f2017ab66C1a1ffF74425889141e51'
    })).toEqual(5)
  })

  it('should return blockchainAccountId for did:ethr', () => {
    const verificationMethod = {
      'id': 'did:ethr:0x1B54DaD834f2017ab66C1a1ffF74425889141e51#controller',
      'type': 'EcdsaSecp256k1RecoveryMethod2020',
      'controller': 'did:ethr:0x1B54DaD834f2017ab66C1a1ffF74425889141e51',
      'blockchainAccountId': 'eip155:1:0x1B54DaD834f2017ab66C1a1ffF74425889141e51'
    }

    expect(getEthereumAddress(verificationMethod)).toEqual("0x1B54DaD834f2017ab66C1a1ffF74425889141e51".toLowerCase())
  })

  it('should return blockchainAccountId for did:key', () => {
    const verificationMethod = {
        "id": "did:key:zQ3shdHG4u9wPDoEzSokyLm3readHkrpYaXFf9jbc8Eiz1UM5#zQ3shdHG4u9wPDoEzSokyLm3readHkrpYaXFf9jbc8Eiz1UM5",
        "type": "EcdsaSecp256k1VerificationKey2019",
        "controller": "did:key:zQ3shdHG4u9wPDoEzSokyLm3readHkrpYaXFf9jbc8Eiz1UM5",
        "publicKeyJwk": {
            "kty": "EC",
            "crv": "secp256k1",
            "x": "6805tExt2N3AcS9cxs_RJT_RtAkfK6rqIix5B4k0oEg",
            "y": "qw0mojIWWljYFYHvsSkcBfaUVfeSf1YEbyFZmzAif2Q"
        }
    }

    expect(getEthereumAddress(verificationMethod)).toEqual("0x923f7158062db4761a8917ad1628d11536c5f07b".toLowerCase())
  })
})
