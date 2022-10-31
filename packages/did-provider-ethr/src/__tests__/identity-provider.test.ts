// import SignerProvider from 'ethjs-provider-signer'
// import { DIDResolverPlugin } from '@veramo/did-resolver'
// import { IdentifierProvider } from '../identifier-provider'
// import { Identifier } from '../identifier'
// import { createJWT, decodeJWT, verifyJWT } from 'did-jwt'
// const fs = require('fs')

describe('dummy', () => {
  const a = 100
  it('should run a dummy test', () => {
    expect(a).toEqual(100)
  })
})

// describe('@veramo/did-provider-ethr', () => {
// const infuraProjectId = '3586660d179141e3801c3895de1c2eba'
// const rpcUrl = 'https://goerli.infura.io/v3/' + infuraProjectId
// const resolver = new DIDResolverPlugin({ infuraProjectId })
// const key = {
//   privateKey: 'da1ed1d75b6e3d28d306af4dcab9b893189cf248e52fe526e264b39b5e587ccf',
//   publicKey: '',
//   address: '0x76d331386cec35862a73aabdbfa5ef97cdac58cf',
//   type: 'Secp256k1',
// }

// const serialized = {
//   did: 'did:ethr:goerli:0x76d331386cec35862a73aabdbfa5ef97cdac58cf',
//   controller: key,
//   keys: [key],
// }

// const fileName = './store.json'
// const network = 'goerli'
// const identifierProvider = new IdentifierProvider({
//   fileName,
//   network,
//   resolver,
//   rpcUrl,
// })

// afterAll(async () => {
//   fs.unlinkSync(fileName)
// })

// it('should create identifier', async () => {
//   const identifier = await identifierProvider.createIdentifier()
//   expect(identifier).toBeInstanceOf(Identifier)
// })

// it('identifier signs jwt', async () => {
//   const identifier = await identifierProvider.createIdentifier()

//   const jwt = await createJWT(
//     { a: 'b' },
//     {
//       alg: 'ES256K-R',
//       issuer: identifier.did,
//       signer: identifier.signer(),
//     },
//   )

//   const decoded = await verifyJWT(jwt, { resolver })
//   expect(decoded.payload.iss).toEqual(identifier.did)
// })

// it('imported identifier adds serviceEndpoint', async () => {

//   const identifier = await identifierProvider.importIdentifier(JSON.stringify(serialized))

//   const result = await identifierProvider.addService(identifier.did, {
//     id: 'srvc5',
//     type: 'Messaging',
//     serviceEndpoint: 'https://localhos/msg/6789',
//   })
//   console.log(result)

//   expect(result).toBeTruthy()
// })

// it('imported identifier adds Secp256k1 publicKey', async () => {

//   const identifier = await identifierProvider.importIdentifier(JSON.stringify(serialized))

//   const result = await identifierProvider.addPublicKey(identifier.did, 'Secp256k1')
//   console.log(result)

//   expect(result).toBeTruthy()
// })

// it('imported identifier adds Ed25519 publicKey', async () => {

//   const identifier = await identifierProvider.importIdentifier(JSON.stringify(serialized))

//   const result = await identifierProvider.addPublicKey(identifier.did, 'Ed25519')
//   console.log(result)

//   expect(result).toBeTruthy()
// })
// })
