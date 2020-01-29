import SignerProvider from 'ethjs-provider-signer'
import { DafResolver } from 'daf-resolver'
import { IdentityProvider } from '../identity-provider'
import { EthrIdentity } from '../ethr-identity'
import { createJWT, decodeJWT } from 'did-jwt'
const fs = require('fs')

describe('daf-ethr-did-fs', () => {
  const infuraProjectId = '5ffc47f65c4042ce847ef66a3fa70d4c'
  const rpcUrl = 'https://rinkeby.infura.io/v3/' + infuraProjectId
  const resolver = new DafResolver({ infuraProjectId })

  const fileName = './store.json'
  const network = 'rinkeby'
  const identityProvider = new IdentityProvider({
    fileName,
    network,
    resolver,
    rpcUrl,
  })

  afterAll(async () => {
    fs.unlinkSync(fileName)
  })

  it('should create identity', async () => {
    const identity = await identityProvider.createIdentity()
    expect(identity).toBeInstanceOf(EthrIdentity)
  })

  it('identity signs jwt', async () => {
    const identity = await identityProvider.createIdentity()

    const jwt = await createJWT(
      { a: 'b' },
      {
        alg: 'ES256K-R',
        issuer: identity.did,
        signer: identity.signer(),
      },
    )

    const decoded = decodeJWT(jwt)
    expect(decoded.payload.iss).toEqual(identity.did)
  })
})
