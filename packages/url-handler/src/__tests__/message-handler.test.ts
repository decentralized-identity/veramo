import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'

import { Message } from '../../../message-handler/src/index.js'
import { UrlMessageHandler } from '../message-handler.js'
import { IAgentContext } from "../../../core-types/src/index.js";

// jest-fetch-mock replacement: use a vitest-native fetch mock.
// The source (url-handler) calls the global `fetch(url)` and reads
// response.url (redirect) and response.text() (body), so each test stubs the
// global `fetch` with a minimal Response-like object. jest-fetch-mock's
// `counter: 1` meant "consume this response once"; we replicate that by setting
// the implementation per test and restoring the global in afterEach.
const fetchMock = vi.fn()
beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock)
})
afterEach(() => {
  vi.unstubAllGlobals()
  fetchMock.mockReset()
})

const context = {
  agent: {
    execute: vi.fn(),
    availableMethods: vi.fn(),
    getSchema: vi.fn(),
    emit: vi.fn(),
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
    expect(message.metaData?.at(-1)).toEqual({ type: 'URL', value: 'https://identifier.foundation/ssi/' })
  })

  it('should record normalized origin and path metadata for bare host URLs', async () => {
    const message = new Message({ raw: 'https://example.com?c_i=jwtvalue' })
    await expect(messageHandler.handle(message, context)).rejects.toThrow('Unsupported message type')
    expect(message.raw).toEqual('jwtvalue')
    expect(message.metaData?.at(-1)).toEqual({ type: 'URL', value: 'https://example.com/' })
  })

  it('should preserve the port in URL metadata', async () => {
    const message = new Message({ raw: 'https://example.com:8443/claim?c_i=jwtvalue' })
    await expect(messageHandler.handle(message, context)).rejects.toThrow('Unsupported message type')
    expect(message.raw).toEqual('jwtvalue')
    expect(message.metaData?.at(-1)).toEqual({ type: 'URL', value: 'https://example.com:8443/claim' })
  })

  it('should ignore message payloads that are not URLs', async () => {
    const message = new Message({ raw: 'this is not a url at all' })
    await expect(messageHandler.handle(message, context)).rejects.toThrow('Unsupported message type')
    expect(message.raw).toEqual('this is not a url at all')
    expect(fetchMock).not.toHaveBeenCalled()
    expect(message.metaData?.some((meta) => meta.type === 'URL')).toBeFalsy()
  })

  it('should treat an empty c_i as absent and fetch the URL instead', async () => {
    const message = new Message({ raw: 'https://example.com/message?c_i=' })
    fetchMock.mockImplementation(() =>
      Promise.resolve({
        url: 'https://example.com/message?c_i=',
        text: async () => 'mockbody',
      } as any),
    )
    await expect(messageHandler.handle(message, context)).rejects.toThrow('Unsupported message type')
    expect(fetchMock).toHaveBeenCalled()
    expect(message.raw).toEqual('mockbody')
  })

  it('should try to load data from URL if URL is not standard', async () => {
    const message = new Message({ raw: 'https://example.com/public-profile.jwt' })
    fetchMock.mockImplementation(() =>
      Promise.resolve({
        url: 'https://example.com/public-profile.jwt',
        text: async () => 'mockbody',
      } as any),
    )
    expect.assertions(2)

    await expect(messageHandler.handle(message, context)).rejects.toThrow('Unsupported message type')

    expect(message.raw).toEqual('mockbody')
  })

  it('should try to load data from redirected URL query', async () => {
    const message = new Message({ raw: 'https://example.com/public-profile.jwt' })
    fetchMock.mockImplementation(() =>
      Promise.resolve({
        url: 'https://some.other.site.example.com?c_i=asdf',
        text: async () => 'mockbody',
      } as any),
    )
    expect.assertions(3)

    await expect(messageHandler.handle(message, context)).rejects.toThrow('Unsupported message type')

    expect(message.raw).toEqual('asdf')
    expect(message.metaData?.at(-1)).toEqual({ type: 'URL', value: 'https://some.other.site.example.com/' })
  })

  it('should try to load data from redirected URL body', async () => {
    const message = new Message({ raw: 'https://example.com/public-profile.jwt' })
    fetchMock.mockImplementation(() =>
      Promise.resolve({
        url: 'https://some.other.example.com/cred.jwt',
        text: async () => 'otherbody',
      } as any),
    )
    expect.assertions(2)

    await expect(messageHandler.handle(message, context)).rejects.toThrow('Unsupported message type')

    expect(message.raw).toEqual('otherbody')
  })
})
