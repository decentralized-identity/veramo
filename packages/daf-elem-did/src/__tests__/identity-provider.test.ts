import util from 'util'

describe('dummy', () => {
  const a = 100
  it('should run a dummy test', () => {
    util.inspect(a)
    expect(a).toEqual(100)
  })
})
