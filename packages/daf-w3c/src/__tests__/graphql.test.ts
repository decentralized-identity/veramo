import { resolvers } from '../graphql'
import { ActionTypes } from '../action-handler'

const mockDid = 'did:example:123'

describe('daf-w3c:graphql', () => {
  it('handles Mutation.signCredentialJwt', async () => {
    const data = {
      issuer: mockDid,
      context: ['https://www.w3.org/2018/credentials/v1'],
      type: ['VerifiableCredential'],
      credentialSubject: {
        id: 'did:web:uport.me',
        you: 'Rock',
      },
    }

    const mockHandleAction = jest.fn()
    const agent = { handleAction: mockHandleAction }

    await resolvers.Mutation.signCredentialJwt(null, { data }, { agent: agent as any })
    expect(mockHandleAction).toBeCalledWith({
      type: ActionTypes.signCredentialJwt,
      data,
    })
  })

  it('handles Mutation.actionSignVp', async () => {
    const data = {
      issuer: mockDid,
      audience: ['did:web:uport.me'],
      context: ['https://www.w3.org/2018/credentials/v1'],
      type: ['VerifiablePresentation'],
      verifiableCredential: ['JWT'],
    }

    const mockHandleAction = jest.fn()
    const agent = { handleAction: mockHandleAction }

    await resolvers.Mutation.signPresentationJwt(null, { data }, { agent: agent as any })
    expect(mockHandleAction).toBeCalledWith({
      type: ActionTypes.signPresentationJwt,
      data,
    })
  })
})
