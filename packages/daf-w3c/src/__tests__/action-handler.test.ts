const mockCreateVerifiableCredential = jest.fn()
const mockCreatePresentation = jest.fn()

jest.mock('did-jwt-vc', () => ({
  createVerifiableCredential: mockCreateVerifiableCredential,
  createPresentation: mockCreatePresentation,
}))

import { ActionHandler, ActionTypes, ActionSignW3cVc, ActionSignW3cVp } from '../index'

const mockDid = 'did:example:123'

const mockSigner = jest.fn()

const mockCore = {
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
  it('handles action.sign.w3c.vc', async () => {
    expect.assertions(1)

    const actionHandler = new ActionHandler()

    const data = {
      sub: 'did:web:uport.me',
      vc: {
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        type: ['VerifiableCredential'],
        credentialSubject: {
          you: 'Rock',
        },
      },
    }

    await actionHandler.handleAction(
      {
        type: ActionTypes.signVc,
        did: mockDid,
        data,
      } as ActionSignW3cVc,
      mockCore as any,
    )

    expect(mockCreateVerifiableCredential).toBeCalledWith(data, { did: mockDid, signer: mockSigner })
  })

  it('handles action.sign.w3c.vp', async () => {
    expect.assertions(1)

    const actionHandler = new ActionHandler()

    const data = {
      sub: 'did:web:uport.me',
      vp: {
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        type: ['VerifiablePresentation'],
        verifiableCredential: ['JWT'],
      },
    }

    await actionHandler.handleAction(
      {
        type: ActionTypes.signVp,
        did: mockDid,
        data,
      } as ActionSignW3cVp,
      mockCore as any,
    )

    expect(mockCreatePresentation).toBeCalledWith(data, { did: mockDid, signer: mockSigner })
  })
})
