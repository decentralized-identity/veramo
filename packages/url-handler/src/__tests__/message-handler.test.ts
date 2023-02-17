import { Message } from '../../../message-handler/src'
import { UrlMessageHandler } from '../message-handler.js'
import fetchMock, { MockParams } from 'jest-fetch-mock'

fetchMock.enableMocks()
import { jest } from '@jest/globals'
import { IAgentContext } from "../../../core-types/src";

const context = {
  agent: {
    execute: jest.fn(),
    availableMethods: jest.fn(),
    getSchema: jest.fn(),
    emit: jest.fn(),
  },
} as IAgentContext<{}>

describe('@veramo/url-handler', () => {
  const messageHandler = new UrlMessageHandler()

  it('should reject unknown message type', async () => {
    const message = new Message({ raw: 'test', metaData: [{ type: 'test' }] })
    await expect(messageHandler.handle(message, context)).rejects.toThrow('Unsupported message type')
  })

  it('should transform message after standard URL', async () => {
    const JWT =
      'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NkstUiJ9.eyJpYXQiOjE1NzU5Njc1MzEsInR5cGUiOiJzZHIiLCJ0YWciOiJzZXNzaW9uLTEyMyIsImNsYWltcyI6W3sicmVhc29uIjoiV2UgbmVlZCB5b3VyIG5hbWUiLCJjbGFpbVR5cGUiOiJuYW1lIn1dLCJpc3MiOiJkaWQ6ZXRocjoweDViMmIwMzM1Mzk4NDM2MDFmYjgxZGYxNzA0OTE4NzA0ZmQwMTQxZmEifQ.KoHbpJ5HkLLIw8iEqsu2Jql9m5dbydNy2zO53GKuIbwfPOW842_IPXw2zwVtj0FcEuHUkzhx-bhS28Zhmvkv2gE'
    const message = new Message({
      raw: 'https://identifier.foundation/ssi/?c_i=' + JWT,
      metaData: [
        {
          type: 'QRCode',
        },
      ],
    })
    await expect(messageHandler.handle(message, context)).rejects.toThrow('Unsupported message type')
    expect(message.raw).toEqual(JWT)
  })

  it('should try to load data from URL if URL is not standard', async () => {
    const message = new Message({ raw: 'https://example.com/public-profile.jwt' })
    fetchMock.mockResponse('mockbody')
    expect.assertions(2)

    await expect(messageHandler.handle(message, context)).rejects.toThrow('Unsupported message type')

    expect(message.raw).toEqual('mockbody')
  })

  it('should try to load data from redirected URL query', async () => {
    const message = new Message({ raw: 'https://example.com/public-profile.jwt' })
    fetchMock.mockResponse('mockbody', {
      counter: 1,
      url: 'https://some.other.site.example.com?c_i=asdf',
    } as MockParams)
    expect.assertions(2)

    await expect(messageHandler.handle(message, context)).rejects.toThrow('Unsupported message type')

    expect(message.raw).toEqual('asdf')
  })

  it('should try to load data from redirected URL body', async () => {
    const message = new Message({ raw: 'https://example.com/public-profile.jwt' })
    fetchMock.mockResponse('otherbody', {
      counter: 1,
      url: 'https://some.other.example.com/cred.jwt',
    } as MockParams)
    expect.assertions(2)

    await expect(messageHandler.handle(message, context)).rejects.toThrow('Unsupported message type')

    expect(message.raw).toEqual('otherbody')
  })
})
