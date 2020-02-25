jest.mock('did-jwt-vc')
import { ActionHandler, ActionTypes, ActionSignW3cVc, ActionSignW3cVp } from '../index'
import { createVerifiableCredential } from 'did-jwt-vc'

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

    createVerifiableCredential.mockReturnValue(Promise.resolve(new Response('4')))

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

    const result = actionHandler.handleAction(
      {
        type: ActionTypes.signVc,
        did: mockDid,
        data,
      } as ActionSignW3cVc,
      mockCore as any,
    )

    expect(createVerifiableCredential).toBeCalledWith(data, { did: mockDid, signer: mockSigner })
  })
})
