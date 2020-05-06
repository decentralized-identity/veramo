import { DafUniversalResolver } from '../resolver'
import fetchMock from 'jest-fetch-mock'
fetchMock.enableMocks()

describe('daf-resolver-universal', () => {
  it('should throw error when misconfigured', () => {
    expect(() => {
      //@ts-ignore
      new DafUniversalResolver({})
    }).toThrow()
  })

  it('should have resolve method', () => {
    const resolver = new DafUniversalResolver({ url: 'https://example/' })
    expect(resolver).toHaveProperty('resolve')
  })

  it('should fetch did doc', async () => {
    const resolver = new DafUniversalResolver({ url: 'https://example/' })
    fetchMock.mockResponse(JSON.stringify({ didDocument: { data: '12345' } }))
    const doc = await resolver.resolve('did:example:123')
    expect(doc).toEqual({ data: '12345' })
  })
})
