import { asArray, intersect, isDefined } from '../type-utils.js'

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

  describe('intersect', () => {
    it('should work with primitive types', () => {
      expect(intersect(['a'], ['b'])).toStrictEqual([])
      expect(intersect(['a', 'a'], ['b'])).toStrictEqual([])
      expect(intersect(['a', 'a', 'b'], ['b'])).toStrictEqual(['b'])
      expect(intersect(['a', 'a', 'b'], ['b', 'a'])).toStrictEqual(['a', 'b'])
      expect(intersect(['a', 'a', 'b', 1], ['b', 'a', 2])).toStrictEqual(['a', 'b'])
      expect(intersect(['a', 'a', 'b', 1], ['b', 1, 2])).toStrictEqual(['b', 1])
      expect(intersect([1, false], [true])).toStrictEqual([])
      expect(intersect([1, false, null], [true, null])).toStrictEqual([null])
      expect(intersect([1, false, undefined], [true, undefined])).toStrictEqual([undefined])
      expect(intersect([1], [true])).toStrictEqual([])
    })

    it('does not work with objects since references are different', () => {
      expect(intersect([{}], [{}])).toStrictEqual([])
    })
  })
})
