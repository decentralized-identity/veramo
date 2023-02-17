import { asArray, isDefined } from '../type-utils.js'

describe('@veramo/utils type utils', () => {
  it('isDefined should return correct results', () => {
    const a = {
      b: 'defined',
    }
    const arr = [null, undefined, 'a', 'b']
    expect(isDefined(undefined)).toBe(false)
    expect(isDefined(null)).toBe(false)
    expect(isDefined(false)).toBe(true)
    expect(isDefined(a.b)).toBe(true)
    expect(isDefined((a as any).c)).toBe(false)
    expect(arr.filter(isDefined)).toEqual(['a', 'b'])
  })

  it('asArray should return an array', () => {
    expect(asArray('a')).toEqual(['a'])
    expect(asArray(['a', 'b'])).toEqual(['a', 'b'])
    expect(asArray(undefined)).toEqual([])
    expect(asArray(null)).toEqual([])
  })
})
