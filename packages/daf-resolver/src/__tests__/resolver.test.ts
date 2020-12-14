import { DafResolver } from '../resolver'
import { Resolver } from 'did-resolver'

describe('daf-resolver', () => {
  it('should throw error when misconfigured', () => {
    expect(() => {
      new DafResolver({
        //@ts-ignore
        resolver: undefined
      })
    }).toThrow()
  })

  it('should have resolve method', () => {
    const resolver = new DafResolver({ resolver: new Resolver() })
    expect(resolver).toHaveProperty('resolveDid')
  })

})
