import { resolvers } from '../graphql'

const mockDid = 'did:example:123'

describe('daf-w3c:graphql', () => {
  it('handles Mutation.actionSignVc', async () => {
    const data = {
      sub: 'did:web:uport.me',
      vc: {
        context: ['https://www.w3.org/2018/credentials/v1'],
        type: ['VerifiableCredential'],
        credentialSubject: {
          you: 'Rock',
        },
      },
    }

    const transformedData = {
      sub: 'did:web:uport.me',
      vc: {
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        type: ['VerifiableCredential'],
        credentialSubject: {
          you: 'Rock',
        },
      },
    }
    const mockHandleAction = jest.fn()
    const core = { handleAction: mockHandleAction }

    await resolvers.Mutation.actionSignVc(null, { data, did: mockDid }, { core: core as any })
    expect(mockHandleAction).toBeCalledWith({
      type: 'action.sign.w3c.vc',
      did: mockDid,
      data: transformedData,
    })
  })

  it('handles Mutation.actionSignVp', async () => {
    const data = {
      aud: 'did:web:uport.me',
      vp: {
        context: ['https://www.w3.org/2018/credentials/v1'],
        type: ['VerifiablePresentation'],
        verifiableCredential: ['JWT'],
      },
    }

    const transformedData = {
      aud: 'did:web:uport.me',
      vp: {
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        type: ['VerifiablePresentation'],
        verifiableCredential: ['JWT'],
      },
    }

    const mockHandleAction = jest.fn()
    const core = { handleAction: mockHandleAction }

    await resolvers.Mutation.actionSignVp(null, { data, did: mockDid }, { core: core as any })
    expect(mockHandleAction).toBeCalledWith({
      type: 'action.sign.w3c.vp',
      did: mockDid,
      data: transformedData,
    })
  })
})
