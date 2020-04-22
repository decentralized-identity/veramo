import { Message, Agent } from 'daf-core'
import { UrlMessageHandler } from '../index'
import fetchMock from 'jest-fetch-mock'
fetchMock.enableMocks()

describe('daf-url', () => {
  const messageHandler = new UrlMessageHandler()

  const agent = new Agent({
    identityProviders: [],
    serviceControllers: [],
    didResolver: { resolve: jest.fn() },
    messageHandler,
  })

  it('should reject unknown message type', async () => {
    const message = new Message({ raw: 'test', metaData: [{ type: 'test' }] })
    expect(messageHandler.handle(message, agent)).rejects.toEqual('Unsupported message type')
  })

  it('should transform message after standard URL', async () => {
    const JWT =
      'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NkstUiJ9.eyJpYXQiOjE1NzU5Njc1MzEsInR5cGUiOiJzZHIiLCJ0YWciOiJzZXNzaW9uLTEyMyIsImNsYWltcyI6W3sicmVhc29uIjoiV2UgbmVlZCB5b3VyIG5hbWUiLCJjbGFpbVR5cGUiOiJuYW1lIn1dLCJpc3MiOiJkaWQ6ZXRocjoweDViMmIwMzM1Mzk4NDM2MDFmYjgxZGYxNzA0OTE4NzA0ZmQwMTQxZmEifQ.KoHbpJ5HkLLIw8iEqsu2Jql9m5dbydNy2zO53GKuIbwfPOW842_IPXw2zwVtj0FcEuHUkzhx-bhS28Zhmvkv2gE'
    const message = new Message({
      raw: 'https://identity.foundation/ssi/?c_i=' + JWT,
      metaData: [
        {
          type: 'QRCode',
        },
      ],
    })
    expect(messageHandler.handle(message, agent)).rejects.toEqual('Unsupported message type')
    expect(message.raw).toEqual(JWT)
  })

  it('should try to load data from URL if URL is not standard', async () => {
    const message = new Message({ raw: 'https://example.com/public-profile.jwt' })
    fetchMock.mockResponse('mockbody')
    expect.assertions(2)
    try {
      await messageHandler.handle(message, agent)
    } catch (e) {
      expect(e).toMatch('Unsupported message type')
    }

    expect(message.raw).toEqual('mockbody')
  })
})
