describe('dummy', () => {
  const a = 100
  it('should run a dummy test', () => {
    expect(a).toEqual(100)
  })
})

// TODO Update these after refactoring did-jwt-vc

// import { W3cActionHandler, ActionTypes, ActionSignW3cVc } from '../index'
// import { SimpleSigner, decodeJWT } from 'did-jwt'
// import { Resolver } from 'did-resolver'
// import { ActionSignW3cVp } from '../action-handler'
// import { Credential } from '@veramo/core'

// const privateKey = 'a285ab66393c5fdda46d6fbad9e27fafd438254ab72ad5acb681a0e9f20f5d7b'
// const signerAddress = '0x2036c6cd85692f0fb2c26e6c6b2eced9e4478dfd'
// const mockDid: string = `did:ethr:${signerAddress}`

// const mockAgent = {
//   didManager: {
//     getIdentifier: async (did: string) => ({
//       did: mockDid,
//       keyByType: async (type: string) => ({
//         signer: () => {
//           return SimpleSigner(privateKey)
//         },
//       }),
//     }),
//   },
//   didResolver: {
//     resolve: async (did: string) => {
//       return {
//         '@context': 'https://www.w3.org/ns/did/v1',
//         id: 'did:ethr:rinkeby:0x42ba71c59a22a037e54f8d5b13d7b3721daa18c3',
//         publicKey: [
//           {
//             id: 'did:ethr:rinkeby:0x42ba71c59a22a037e54f8d5b13d7b3721daa18c3#owner',
//             type: 'EcdsaSecp256k1VerificationKey2019',
//             owner: 'did:ethr:rinkeby:0x42ba71c59a22a037e54f8d5b13d7b3721daa18c3',
//             ethereumAddress: '0x42ba71c59a22a037e54f8d5b13d7b3721daa18c3',
//           },
//         ],
//         authentication: [
//           {
//             type: 'Secp256k1SignatureAuthentication2018',
//             publicKey: 'did:ethr:rinkeby:0x42ba71c59a22a037e54f8d5b13d7b3721daa18c3#owner',
//           },
//         ],
//       }
//     },
//   },
// }

// describe('@veramo/credential-w3c', () => {
//   // it('handles signing a presentation with credentialStatus', async () => {
//   //   expect.assertions(1)

//   //   const actionHandler = new W3cActionHandler()

//   //   const data = {
//   //     issuer: mockDid,
//   //     audience: 'did:web:uport.me',
//   //     '@context': ['https://www.w3.org/2018/credentials/v1'],
//   //     type: ['VerifiablePresentation'],
//   //     verifiableCredential: ['eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NkstUiJ9.eyJpYXQiOjE1ODU4MTEyNTksInN1YiI6ImRpZDp3ZWI6dXBvcnQubWUiLCJ2YyI6eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSJdLCJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIl0sImNyZWRlbnRpYWxTdWJqZWN0Ijp7Im5hbWUiOiJCb2IifX0sImlzcyI6ImRpZDpldGhyOnJpbmtlYnk6MHg0MmJhNzFjNTlhMjJhMDM3ZTU0ZjhkNWIxM2Q3YjM3MjFkYWExOGMzIn0.lSuP2V-xr0RaW-M_egBXnhv0cUuM7Vp54wz1A_f3zCXjR7-bcfk1HqvweQsX-m7mXx9J9sn2vNS6YcJhWk2oBAE'],
//   //     credentialStatus: {
//   //       type: 'TestStatusMethod',
//   //       id: 'local'
//   //     }
//   //   }

//   //   let result = await actionHandler.handleAction(
//   //     {
//   //       type: ActionTypes.signPresentationJwt,
//   //       data,
//   //     } as ActionSignW3cVp,
//   //     mockAgent as any,
//   //   )

//   //   console.log("gigel", result)

//   //   expect(result.credentialStatus).toMatchObject({ type: 'TestStatusMethod', id: 'local' })
//   // })

//   it('handles sign.w3c.vc.jwt with credentialStatus', async () => {
//     // expect.assertions(1)

//     const actionHandler = new W3cActionHandler()

//     const data = {
//       issuer: mockDid,
//       '@context': ['https://www.w3.org/2018/credentials/v1'],
//       type: ['VerifiableCredential'],
//       credentialSubject: {
//         id: 'did:web:uport.me',
//         you: 'Rock',
//       },
//       credentialStatus: {
//         type: 'TestStatusMethod',
//         id: 'local',
//       },
//     }

//     let result: Credential = await actionHandler.handleAction(
//       {
//         type: ActionTypes.signCredentialJwt,
//         data,
//       } as ActionSignW3cVc,
//       mockAgent as any,
//     )

//     const decoded = decodeJWT(result.raw)

//     expect(decoded.payload.credentialStatus).toMatchObject({ type: 'TestStatusMethod', id: 'local' })
//   })
// })
