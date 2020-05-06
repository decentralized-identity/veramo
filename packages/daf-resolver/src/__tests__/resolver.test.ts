import { DafResolver } from '../resolver'

describe('daf-resolver', () => {
  it('should throw error when misconfigured', () => {
    expect(() => {
      new DafResolver({})
    }).toThrow()
  })

  it('should have resolve method', () => {
    const resolver = new DafResolver({ infuraProjectId: 'xxx' })
    expect(resolver).toHaveProperty('resolve')
  })
})
