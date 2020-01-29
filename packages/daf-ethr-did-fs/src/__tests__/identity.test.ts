import { EthrIdentity } from '../ethr-identity'
import { DafResolver } from 'daf-resolver'

describe('daf-ethr-did-fs-identity', () => {
  const infuraProjectId = '5ffc47f65c4042ce847ef66a3fa70d4c'
  const rpcUrl = 'https://rinkeby.infura.io/v3/' + infuraProjectId
  const privateKey = ''
  const address = '0xf09b1640417a4270b3631306b42403fa8c45d63d'
  const did = 'did:ethr:rinkeby:0xf09b1640417a4270b3631306b42403fa8c45d63d'
  const network = 'rinkeby'
  const resolver = new DafResolver({ infuraProjectId })

  it('identity adds service endpoint', async () => {
    const identity = new EthrIdentity({
      did,
      address,
      resolver,
      network,
      privateKey,
      identityProviderType: 'test',
      rpcUrl,
    })

    const result = await identity.addService({
      id: 'srvc1',
      type: 'Messaging',
      serviceEndpoint: 'https://localhos:3000/msg',
    })

    expect(result).toEqual(true)
  })
})
