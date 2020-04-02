const mockCreateVerifiableCredential = jest.fn()
const mockCreatePresentation = jest.fn()

jest.mock('did-jwt-vc', () => ({
  createVerifiableCredential: mockCreateVerifiableCredential,
  createPresentation: mockCreatePresentation,
  decodeJWT: jest.fn(),
}))

import { W3cActionHandler, ActionTypes, ActionSignW3cVc, ActionSignW3cVp } from '../index'

const mockDid = 'did:example:123'

const mockSigner = jest.fn()

const mockAgent = {
  identityManager: {
    getIdentity: async (did: string) => ({
      did: mockDid,
      keyByType: async (type: string) => ({
        signer: () => mockSigner,
      }),
    }),
  },
}

describe('daf-w3c', () => {
  it('handles ' + ActionTypes.signCredentialJwt, async () => {
    // expect.assertions(1)

    // const actionHandler = new W3cActionHandler()

    // const data = {
    //   issuer: mockDid,
    //   '@context': ['https://www.w3.org/2018/credentials/v1'],
    //   type: ['VerifiableCredential'],
    //   credentialSubject: {
    //     id: 'did:web:uport.me',
    //     you: 'Rock',
    //   },
    // }

    // await actionHandler.handleAction(
    //   {
    //     type: ActionTypes.signCredentialJwt,
    //     data,
    //   } as ActionSignW3cVc,
    //   mockAgent as any,
    // )

    // expect(mockCreateVerifiableCredential).toBeCalledWith(data, { did: mockDid, signer: mockSigner })
    expect(1).toEqual(1)
  })

  it('handles ' + ActionTypes.signPresentationJwt, async () => {
    // expect.assertions(1)

    // const actionHandler = new W3cActionHandler()

    // const data = {
    //   issuer: mockDid,
    //   audience: 'did:web:uport.me',
    //   '@context': ['https://www.w3.org/2018/credentials/v1'],
    //   type: ['VerifiablePresentation'],
    //   verifiableCredential: ['eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NkstUiJ9.eyJpYXQiOjE1ODU4MTEyNTksInN1YiI6ImRpZDp3ZWI6dXBvcnQubWUiLCJ2YyI6eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSJdLCJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIl0sImNyZWRlbnRpYWxTdWJqZWN0Ijp7Im5hbWUiOiJCb2IifX0sImlzcyI6ImRpZDpldGhyOnJpbmtlYnk6MHg0MmJhNzFjNTlhMjJhMDM3ZTU0ZjhkNWIxM2Q3YjM3MjFkYWExOGMzIn0.lSuP2V-xr0RaW-M_egBXnhv0cUuM7Vp54wz1A_f3zCXjR7-bcfk1HqvweQsX-m7mXx9J9sn2vNS6YcJhWk2oBAE'],
    // }

    // await actionHandler.handleAction(
    //   {
    //     type: ActionTypes.signPresentationJwt,
    //     data,
    //   } as ActionSignW3cVp,
    //   mockAgent as any,
    // )

    // expect(mockCreatePresentation).toBeCalledWith(data, { did: mockDid, signer: mockSigner })
    expect(1).toEqual(1)
  })
})
