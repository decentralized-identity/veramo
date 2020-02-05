import SignerProvider from 'ethjs-provider-signer'
import { DafResolver } from 'daf-resolver'
import { IdentityProvider } from '../identity-provider'
import { EthrIdentity } from '../ethr-identity'
import { createJWT, decodeJWT, verifyJWT } from 'did-jwt'
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

    const decoded = await verifyJWT(jwt, { resolver })
    expect(decoded.payload.iss).toEqual(identity.did)
  })

  // it('imported identity adds serviceEndpoint', async () => {
  //   const serialized = {
  //     did: 'did:ethr:rinkeby:0xf09b1640417a4270b3631306b42403fa8c45d63d',
  //     keySet: {
  //       keys: [
  //         {
  //           crv: 'secp256k1',
  //           x: 'z93SgW9Dagt89Sts0NEIN7XMPpHli5Vr1n8nZ97-Ae4',
  //           y: 'HracHTExUzEuhZm7auhpDgVJRGYumwhWZHdrNAvzogk',
  //           d: '', //@TODO: figure out how to do this without revealing private keys
  //           kty: 'EC',
  //           kid: 'yAfcGZwuMFCvi_PZmCs7WVihA-ZAnyr0LCoafnORGk4',
  //         },
  //       ],
  //     },
  //   }
  //   const identity = await identityProvider.importIdentity(JSON.stringify(serialized))

  //   const result = await identityProvider.addService(identity.did, {
  //     id: 'srvc4',
  //     type: 'Messaging',
  //     serviceEndpoint: 'https://localhos:5000/msg',
  //   })

  //   expect(result).toBeTruthy()
  // })
})
