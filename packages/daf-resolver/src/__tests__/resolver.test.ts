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
it.todo('should resolve example did')
it.todo('should fail predictably when unsupported method is resolved')
it.todo('should resolve ethr-did with RPC URL')
it.todo('should resolve ethr-did with custom web3 provider')
  it('should have resolve method', () => {
    const resolver = new DafResolver({ resolver: new Resolver() })
    expect(resolver).toHaveProperty('resolveDid')
  })

})
