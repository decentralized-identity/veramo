import { getChainIdForDidEthr, getEthereumAddress } from '../did-utils'

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
      'blockchainAccountId':'did:ethr:0x1B54DaD834f2017ab66C1a1ffF74425889141e51@eip155:1'
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
      'controller': 'did:ethr:0x1B54DaD834f2017ab66C1a1ffF74425889141e51',
      'blockchainAccountId':'did:ethr:rinkeby:0x1B54DaD834f2017ab66C1a1ffF74425889141e51@eip155:4'
    })).toEqual(4)
  })

  it('should return blockchainAccountId for did:ethr', () => {
    const verificationMethod = {
      'id': 'did:ethr:0x1B54DaD834f2017ab66C1a1ffF74425889141e51#controller',
      'type': 'EcdsaSecp256k1RecoveryMethod2020',
      'controller': 'did:ethr:0x1B54DaD834f2017ab66C1a1ffF74425889141e51',
      'blockchainAccountId': '0x1B54DaD834f2017ab66C1a1ffF74425889141e51@eip155:1'
    }

    expect(getEthereumAddress(verificationMethod)).toEqual("0x1B54DaD834f2017ab66C1a1ffF74425889141e51".toLowerCase())
  })
})
