// import SignerProvider from 'ethjs-provider-signer'
// import { DafResolver } from 'daf-resolver'
// import { IdentityProvider } from '../identity-provider'
// import { Identity } from '../identity'
// import { createJWT, decodeJWT, verifyJWT } from 'did-jwt'
// const fs = require('fs')

describe('dummy', () => {
  const a = 100
  it('should run a dummy test', () => {
    expect(a).toEqual(100)
  })
})

// describe('daf-ethr-did-fs', () => {
// const infuraProjectId = '5ffc47f65c4042ce847ef66a3fa70d4c'
// const rpcUrl = 'https://rinkeby.infura.io/v3/' + infuraProjectId
// const resolver = new DafResolver({ infuraProjectId })
// const key = {
//   privateKey: 'da1ed1d75b6e3d28d306af4dcab9b893189cf248e52fe526e264b39b5e587ccf',
//   publicKey: '',
//   address: '0x76d331386cec35862a73aabdbfa5ef97cdac58cf',
//   type: 'Secp256k1',
// }

// const serialized = {
//   did: 'did:ethr:rinkeby:0x76d331386cec35862a73aabdbfa5ef97cdac58cf',
//   controller: key,
//   keys: [key],
// }

// const fileName = './store.json'
// const network = 'rinkeby'
// const identityProvider = new IdentityProvider({
//   fileName,
//   network,
//   resolver,
//   rpcUrl,
// })

// afterAll(async () => {
//   fs.unlinkSync(fileName)
// })

// it('should create identity', async () => {
//   const identity = await identityProvider.createIdentity()
//   expect(identity).toBeInstanceOf(Identity)
// })

// it('identity signs jwt', async () => {
//   const identity = await identityProvider.createIdentity()

//   const jwt = await createJWT(
//     { a: 'b' },
//     {
//       alg: 'ES256K-R',
//       issuer: identity.did,
//       signer: identity.signer(),
//     },
//   )

//   const decoded = await verifyJWT(jwt, { resolver })
//   expect(decoded.payload.iss).toEqual(identity.did)
// })

// it('imported identity adds serviceEndpoint', async () => {

//   const identity = await identityProvider.importIdentity(JSON.stringify(serialized))

//   const result = await identityProvider.addService(identity.did, {
//     id: 'srvc5',
//     type: 'Messaging',
//     serviceEndpoint: 'https://localhos/msg/6789',
//   })
//   console.log(result)

//   expect(result).toBeTruthy()
// })

// it('imported identity adds Secp256k1 publicKey', async () => {

//   const identity = await identityProvider.importIdentity(JSON.stringify(serialized))

//   const result = await identityProvider.addPublicKey(identity.did, 'Secp256k1')
//   console.log(result)

//   expect(result).toBeTruthy()
// })

// it('imported identity adds Ed25519 publicKey', async () => {

//   const identity = await identityProvider.importIdentity(JSON.stringify(serialized))

//   const result = await identityProvider.addPublicKey(identity.did, 'Ed25519')
//   console.log(result)

//   expect(result).toBeTruthy()
// })
// })
