import { DIDResolverPlugin } from '../resolver.js'
import { Resolver } from 'did-resolver'

describe('@veramo/did-resolver', () => {
  it('should throw error when misconfigured', () => {
    expect(() => {
      new DIDResolverPlugin({
        // @ts-ignore
        resolver: undefined,
      })
    }).toThrow()
  })

  it('should have resolve method', () => {
    const resolver = new DIDResolverPlugin({ resolver: new Resolver() })
    expect(resolver).toHaveProperty('resolveDid')
  })
})
